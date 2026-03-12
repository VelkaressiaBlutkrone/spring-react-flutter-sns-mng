package com.example.sns.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sns.domain.NotificationType;
import com.example.sns.domain.Post;
import com.example.sns.domain.PostLike;
import com.example.sns.domain.User;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.repository.PostLikeRepository;
import com.example.sns.repository.PostRepository;
import com.example.sns.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void like(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (postLikeRepository.existsByUserAndPost(user, post)) {
            return;
        }

        postLikeRepository.save(new PostLike(user, post));
        notificationService.create(post.getAuthor().getId(), NotificationType.LIKE, userId, postId);
    }

    @Transactional
    public void unlike(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        postLikeRepository.findByUserAndPost(user, post)
                .ifPresent(postLikeRepository::delete);
    }

    public int countByPost(Post post) {
        return postLikeRepository.countByPost(post);
    }

    public boolean isLikedByUser(Long userId, Post post) {
        if (userId == null) return false;
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;
        return postLikeRepository.existsByUserAndPost(user, post);
    }

    public List<Long> getLikedPostIds(Long userId) {
        return postLikeRepository.findPostIdsByUserId(userId);
    }
}

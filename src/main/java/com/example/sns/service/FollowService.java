package com.example.sns.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sns.domain.Follow;
import com.example.sns.domain.NotificationType;
import com.example.sns.domain.User;
import com.example.sns.dto.response.UserProfileResponse;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.repository.FollowRepository;
import com.example.sns.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (followRepository.existsByFollowerAndFollowing(follower, following)) {
            return;
        }

        followRepository.save(new Follow(follower, following));
        notificationService.create(followingId, NotificationType.FOLLOW, followerId, null);
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        followRepository.findByFollowerAndFollowing(follower, following)
                .ifPresent(followRepository::delete);
    }

    public List<Long> getFollowingIds(Long userId) {
        return followRepository.findFollowingIdsByFollowerId(userId);
    }

    public int getFollowersCount(User user) {
        return followRepository.countByFollowing(user);
    }

    public int getFollowingCount(User user) {
        return followRepository.countByFollower(user);
    }

    public UserProfileResponse getPublicProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        return UserProfileResponse.from(
                user,
                followRepository.countByFollowing(user),
                followRepository.countByFollower(user)
        );
    }
}

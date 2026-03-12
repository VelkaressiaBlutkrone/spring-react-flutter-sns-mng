package com.example.sns.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.sns.domain.Post;
import com.example.sns.domain.PostLike;
import com.example.sns.domain.User;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByUserAndPost(User user, Post post);

    Optional<PostLike> findByUserAndPost(User user, Post post);

    int countByPost(Post post);

    @Query("SELECT pl.post.id FROM PostLike pl WHERE pl.user.id = :userId")
    List<Long> findPostIdsByUserId(@Param("userId") Long userId);
}

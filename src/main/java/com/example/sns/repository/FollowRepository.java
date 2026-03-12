package com.example.sns.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.sns.domain.Follow;
import com.example.sns.domain.User;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    int countByFollowing(User following);

    int countByFollower(User follower);

    @Query("SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId")
    List<Long> findFollowingIdsByFollowerId(@Param("userId") Long userId);

    List<Follow> findByFollowing(User following);

    List<Follow> findByFollower(User follower);
}

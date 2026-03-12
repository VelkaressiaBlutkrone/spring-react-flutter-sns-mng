package com.example.sns.dto.response;

import com.example.sns.domain.User;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 사용자 공개 프로필 응답 DTO.
 * 프론트엔드 호환: name 별칭 제공.
 */
public record UserProfileResponse(
        Long id,
        String email,
        String nickname,
        String bio,
        String profilePic,
        String role,
        Integer followersCount,
        Integer followingCount
) {

    @JsonProperty("name")
    public String name() {
        return nickname;
    }

    public static UserProfileResponse from(User user, int followersCount, int followingCount) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getBio(),
                user.getProfilePic(),
                user.getRole().name(),
                followersCount,
                followingCount
        );
    }

    public static UserProfileResponse from(User user) {
        return from(user, 0, 0);
    }
}

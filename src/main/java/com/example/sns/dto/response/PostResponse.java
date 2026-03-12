package com.example.sns.dto.response;

import java.time.LocalDateTime;

import com.example.sns.domain.Post;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 게시글 응답 DTO.
 * 프론트엔드 호환: userId, userName, lat, lng 별칭 제공.
 */
public record PostResponse(
        Long id,
        Long authorId,
        String authorNickname,
        String title,
        String content,
        Double latitude,
        Double longitude,
        Long pinId,
        String imageUrl,
        String category,
        boolean notice,
        Integer likesCount,
        Boolean isLiked,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    @JsonProperty("userId")
    public Long userId() {
        return authorId;
    }

    @JsonProperty("userName")
    public String userName() {
        return authorNickname;
    }

    @JsonProperty("lat")
    public Double lat() {
        return latitude;
    }

    @JsonProperty("lng")
    public Double lng() {
        return longitude;
    }

    public static PostResponse from(Post post) {
        return from(post, 0, false);
    }

    public static PostResponse from(Post post, int likesCount, boolean isLiked) {
        return new PostResponse(
                post.getId(),
                post.getAuthor().getId(),
                post.getAuthor().getNickname(),
                post.getTitle(),
                post.getContent(),
                post.getLatitude(),
                post.getLongitude(),
                post.getPin() != null ? post.getPin().getId() : null,
                post.getImageUrl(),
                post.getCategory(),
                post.isNotice(),
                likesCount,
                isLiked,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}

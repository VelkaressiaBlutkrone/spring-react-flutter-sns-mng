package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 게시글 수정 요청.
 * 프론트엔드 호환: imageUrl, category 필드 추가.
 */
public record PostUpdateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200)
        String title,

        @NotBlank(message = "내용은 필수입니다.")
        String content,

        Double latitude,
        Double longitude,
        Long pinId,
        String imageUrl,
        String category
) {
}

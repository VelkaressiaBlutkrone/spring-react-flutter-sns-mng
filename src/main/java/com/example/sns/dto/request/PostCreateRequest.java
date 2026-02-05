package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 게시글 작성 요청.
 *
 * API 명세 4.3 PostCreateRequest.
 */
public record PostCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200)
        String title,

        @NotBlank(message = "내용은 필수입니다.")
        String content,

        Double latitude,
        Double longitude,
        Long pinId
) {
}

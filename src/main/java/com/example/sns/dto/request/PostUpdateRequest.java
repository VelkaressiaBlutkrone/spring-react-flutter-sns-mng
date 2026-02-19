package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 게시글 수정 요청.
 *
 * API 명세 4.4 PostUpdateRequest.
 * latitude, longitude, pinId: 위치 수정(선택). null이면 기존 유지, 명시 시 업데이트.
 */
public record PostUpdateRequest(
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

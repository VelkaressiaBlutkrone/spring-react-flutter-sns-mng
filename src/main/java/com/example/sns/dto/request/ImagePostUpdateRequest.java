package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 이미지 게시글 수정 요청.
 *
 * API 명세 5.4. image는 Controller에서 별도 MultipartFile로 받음.
 */
public record ImagePostUpdateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200)
        String title,

        @NotBlank(message = "내용은 필수입니다.")
        String content
) {
}

package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 개인정보 수정 요청 DTO.
 *
 * RULE 1.3: 입력값 검증 (@Valid).
 * Step 14: 마이페이지 개인정보 수정.
 */
public record MemberUpdateRequest(

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(max = 100, message = "닉네임은 100자 이하여야 합니다.")
        String nickname
) {
}

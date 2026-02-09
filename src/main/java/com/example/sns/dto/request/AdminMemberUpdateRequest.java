package com.example.sns.dto.request;

import com.example.sns.domain.UserRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 관리자 회원 수정 요청 DTO.
 *
 * RULE 1.3: 입력값 검증 (@Valid).
 * Step 15: 관리자 회원 수정 (프로필·역할).
 */
public record AdminMemberUpdateRequest(

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(max = 100, message = "닉네임은 100자 이하여야 합니다.")
        String nickname,

        @NotNull(message = "역할을 선택해주세요.")
        UserRole role
) {
}

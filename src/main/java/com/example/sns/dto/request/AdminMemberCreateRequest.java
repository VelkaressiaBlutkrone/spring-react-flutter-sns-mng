package com.example.sns.dto.request;

import com.example.sns.domain.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 관리자 회원 추가 요청 DTO.
 *
 * RULE 1.3: 입력값 검증 (@Valid).
 * Step 15: 관리자에 의한 회원 등록 (역할 지정 가능).
 */
public record AdminMemberCreateRequest(

        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
        String password,

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(max = 100)
        String nickname,

        @NotNull(message = "역할을 선택해주세요.")
        UserRole role
) {
}

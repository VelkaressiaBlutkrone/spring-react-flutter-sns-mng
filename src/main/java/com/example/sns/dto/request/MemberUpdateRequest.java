package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 개인정보 수정 요청 DTO.
 * 프론트엔드 호환: bio, profilePic 필드 추가.
 */
public record MemberUpdateRequest(

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(max = 100, message = "닉네임은 100자 이하여야 합니다.")
        String nickname,

        @Size(max = 500)
        String bio,

        @Size(max = 500)
        String profilePic
) {
}

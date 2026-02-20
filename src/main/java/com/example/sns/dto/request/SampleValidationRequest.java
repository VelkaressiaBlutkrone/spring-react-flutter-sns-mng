package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @Valid 검증 예시 요청 DTO.
 *
 * Controller 단에서 형식 검증 적용 (RULE 1.3.1).
 * Step 2 검증 패턴 시연용.
 */
public record SampleValidationRequest(
        /** 이름 (필수, 1~100자) */
        @NotBlank(message = "이름은 필수입니다.")
        @Size(min = 1, max = 100)
        String name,

        /** 설명 (선택, 최대 500자) */
        @Size(max = 500)
        String description
) {
}

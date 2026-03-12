package com.example.sns.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Pin 생성 요청.
 * 프론트엔드 호환: title, category 필드 추가.
 */
public record PinCreateRequest(
        @NotNull(message = "위도는 필수입니다.")
        Double latitude,

        @NotNull(message = "경도는 필수입니다.")
        Double longitude,

        @Size(max = 200)
        String title,

        @Size(max = 500)
        String description,

        String category
) {
}

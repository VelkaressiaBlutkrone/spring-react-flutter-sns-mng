package com.example.sns.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Pin 수정 요청.
 * 프론트엔드 호환: title, category 필드 추가.
 */
public record PinUpdateRequest(
        @Size(max = 200)
        String title,

        @Size(max = 500)
        String description,

        String category,

        Double latitude,
        Double longitude
) {
}

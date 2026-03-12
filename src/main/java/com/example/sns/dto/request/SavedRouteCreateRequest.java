package com.example.sns.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SavedRouteCreateRequest(
        @NotBlank(message = "경로 이름은 필수입니다.")
        @Size(max = 200)
        String name,

        String points,
        String path,
        Double distance,
        Integer duration,
        String transportMode
) {
}

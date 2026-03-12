package com.example.sns.dto.response;

import java.time.LocalDateTime;

import com.example.sns.domain.SavedRoute;

public record SavedRouteResponse(
        Long id,
        Long userId,
        String name,
        String points,
        String path,
        Double distance,
        Integer duration,
        String transportMode,
        LocalDateTime createdAt
) {

    public static SavedRouteResponse from(SavedRoute r) {
        return new SavedRouteResponse(
                r.getId(),
                r.getUser().getId(),
                r.getName(),
                r.getPoints(),
                r.getPath(),
                r.getDistance(),
                r.getDuration(),
                r.getTransportMode(),
                r.getCreatedAt()
        );
    }
}

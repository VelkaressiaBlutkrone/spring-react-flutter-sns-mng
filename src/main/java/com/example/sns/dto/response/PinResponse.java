package com.example.sns.dto.response;

import java.time.LocalDateTime;

import com.example.sns.domain.Pin;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Pin 응답 DTO.
 * 프론트엔드 호환: userId, userName, lat, lng 별칭 제공.
 */
public record PinResponse(
        Long id,
        Long ownerId,
        String ownerNickname,
        String title,
        String description,
        String category,
        Double latitude,
        Double longitude,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    @JsonProperty("userId")
    public Long userId() {
        return ownerId;
    }

    @JsonProperty("userName")
    public String userName() {
        return ownerNickname;
    }

    @JsonProperty("lat")
    public Double lat() {
        return latitude;
    }

    @JsonProperty("lng")
    public Double lng() {
        return longitude;
    }

    public static PinResponse from(Pin pin) {
        return new PinResponse(
                pin.getId(),
                pin.getOwner().getId(),
                pin.getOwner().getNickname(),
                pin.getTitle(),
                pin.getDescription(),
                pin.getCategory(),
                pin.getLatitude(),
                pin.getLongitude(),
                pin.getCreatedAt(),
                pin.getUpdatedAt()
        );
    }
}

package com.example.sns.dto.response;

import java.time.LocalDateTime;

import com.example.sns.domain.Notification;

public record NotificationResponse(
        Long id,
        Long userId,
        String type,
        Long fromUserId,
        String fromUserName,
        String fromUserProfilePic,
        Long postId,
        boolean isRead,
        LocalDateTime createdAt
) {

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUser().getId(),
                n.getType().name().toLowerCase(),
                n.getFromUser().getId(),
                n.getFromUser().getNickname(),
                n.getFromUser().getProfilePic(),
                n.getPostId(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}

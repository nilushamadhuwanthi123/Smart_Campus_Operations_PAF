package com.smartcampus.notification.dto;

import java.time.Instant;

public record UserNotificationResponse(
        String id,
        String userId,
        String title,
        String message,
        String type,
        boolean read,
        String link,
        Instant createdAt,
        Instant readAt) {
}

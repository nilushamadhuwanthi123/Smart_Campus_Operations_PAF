package com.smartcampus.notification.service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.notification.dto.UserNotificationResponse;
import com.smartcampus.notification.entity.UserNotification;
import com.smartcampus.notification.repository.UserNotificationRepository;

@Service
public class UserNotificationService {

    private static final String TYPE_INFO = "INFO";
    private static final String TYPE_SUCCESS = "SUCCESS";
    private static final String TYPE_WARNING = "WARNING";
    private static final String TYPE_ERROR = "ERROR";

    private static final Set<String> ALLOWED_TYPES = Set.of(
            TYPE_INFO,
            TYPE_SUCCESS,
            TYPE_WARNING,
            TYPE_ERROR);

    private static final int DEFAULT_LIMIT = 100;
    private static final int MAX_LIMIT = 300;

    private final UserNotificationRepository userNotificationRepository;

    public UserNotificationService(UserNotificationRepository userNotificationRepository) {
        this.userNotificationRepository = userNotificationRepository;
    }

    public List<UserNotificationResponse> getNotifications(AppUserPrincipal principal, Integer limit) {
        int normalizedLimit = normalizeLimit(limit);

        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .limit(normalizedLimit)
                .map(this::toResponse)
                .toList();
    }

    public UserNotificationResponse markAsRead(String id, AppUserPrincipal principal) {
        UserNotification notification = userNotificationRepository
                .findByIdAndUserId(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notification = userNotificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    public void markAllAsRead(AppUserPrincipal principal) {
        List<UserNotification> unreadNotifications = userNotificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(principal.getId());

        if (unreadNotifications.isEmpty()) {
            return;
        }

        Instant now = Instant.now();

        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(now);
        });

        userNotificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(String id, AppUserPrincipal principal) {
        UserNotification notification = userNotificationRepository
                .findByIdAndUserId(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        userNotificationRepository.delete(notification);
    }

    public void createNotificationForUser(
            String userId,
            String title,
            String message,
            String type,
            String link) {
        if (userId == null || userId.isBlank()) {
            return;
        }

        UserNotification notification = new UserNotification();
        notification.setUserId(userId.trim());
        notification.setTitle(normalizeRequiredText(title, "Notification title is required"));
        notification.setMessage(normalizeRequiredText(message, "Notification message is required"));
        notification.setType(normalizeType(type));
        notification.setLink(normalizeOptionalText(link));
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        notification.setReadAt(null);

        userNotificationRepository.save(notification);
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }

        if (limit < 1 || limit > MAX_LIMIT) {
            throw new ResourceConflictException("limit must be between 1 and " + MAX_LIMIT);
        }

        return limit;
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return TYPE_INFO;
        }

        String normalizedType = type.trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_TYPES.contains(normalizedType)) {
            throw new ResourceConflictException("Unsupported notification type");
        }

        return normalizedType;
    }

    private String normalizeRequiredText(String value, String requiredMessage) {
        if (value == null || value.isBlank()) {
            throw new ResourceConflictException(requiredMessage);
        }

        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private UserNotificationResponse toResponse(UserNotification notification) {
        return new UserNotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getLink(),
                notification.getCreatedAt(),
                notification.getReadAt());
    }
}

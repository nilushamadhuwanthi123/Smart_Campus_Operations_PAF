package com.smartcampus.notification.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.notification.dto.UserNotificationResponse;
import com.smartcampus.notification.service.UserNotificationService;

@RestController
@RequestMapping("/api/notifications")
public class UserNotificationController {

    private final UserNotificationService userNotificationService;

    public UserNotificationController(UserNotificationService userNotificationService) {
        this.userNotificationService = userNotificationService;
    }

    @GetMapping
    public List<UserNotificationResponse> getNotifications(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(required = false) Integer limit) {
        return userNotificationService.getNotifications(principal, limit);
    }

    @PatchMapping("/{id}/read")
    public UserNotificationResponse markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return userNotificationService.markAsRead(id, principal);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(@AuthenticationPrincipal AppUserPrincipal principal) {
        userNotificationService.markAllAsRead(principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotification(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        userNotificationService.deleteNotification(id, principal);
    }
}

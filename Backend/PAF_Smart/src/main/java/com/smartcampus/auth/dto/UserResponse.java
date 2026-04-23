package com.smartcampus.auth.dto;

import java.time.Instant;

import com.smartcampus.auth.entity.AuthProvider;
import com.smartcampus.auth.entity.UserRole;

public record UserResponse(
        String id,
        String fullName,
        String phoneNumber,
        String email,
        UserRole role,
        AuthProvider authProvider,
        Instant createdAt,
        Instant updatedAt) {
}

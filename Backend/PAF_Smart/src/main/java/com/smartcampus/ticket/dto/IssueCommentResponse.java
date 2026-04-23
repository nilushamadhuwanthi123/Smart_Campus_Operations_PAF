package com.smartcampus.ticket.dto;

import java.time.Instant;

public record IssueCommentResponse(
        String id,
        String userId,
        String userName,
        String userRole,
        String message,
        Instant createdAt) {
}

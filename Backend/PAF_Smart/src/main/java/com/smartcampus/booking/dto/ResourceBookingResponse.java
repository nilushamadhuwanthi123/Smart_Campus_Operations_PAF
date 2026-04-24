package com.smartcampus.booking.dto;

import java.time.Instant;

public record ResourceBookingResponse(
        String id,
        String resourceId,
        String resourceName,
        String resourceType,
        String resourceLocation,
        String bookedByUserId,
        String bookedByUserName,
        String bookedByUserEmail,
        String date,
        String startTime,
        String endTime,
        Instant startTimeUtc,
        Instant endTimeUtc,
        String purpose,
        Integer expectedAttendees,
        String status,
        String adminReviewReason,
        String reviewedByUserId,
        String reviewedByUserName,
        Instant reviewedAt,
        String cancellationReason,
        Instant cancelledAt,
        Instant checkedInAt,
        Instant createdAt,
        Instant updatedAt) {
}

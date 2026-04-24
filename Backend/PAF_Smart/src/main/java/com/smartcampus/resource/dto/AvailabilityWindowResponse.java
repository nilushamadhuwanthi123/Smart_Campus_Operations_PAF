package com.smartcampus.resource.dto;

public record AvailabilityWindowResponse(
        String dayOfWeek,
        String startTime,
        String endTime) {
}

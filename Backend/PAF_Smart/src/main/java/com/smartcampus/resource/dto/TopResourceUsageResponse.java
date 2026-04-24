package com.smartcampus.resource.dto;

public record TopResourceUsageResponse(
        String resourceId,
        String resourceName,
        String resourceType,
        String location,
        long bookingCount) {
}

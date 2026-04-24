package com.smartcampus.resource.dto;

import java.time.Instant;
import java.util.List;

public record CampusResourceResponse(
        String id,
        String name,
        String type,
        int capacity,
        String location,
        List<AvailabilityWindowResponse> availabilityWindows,
        String status,
        String description,
        Instant createdAt,
        Instant updatedAt) {
}

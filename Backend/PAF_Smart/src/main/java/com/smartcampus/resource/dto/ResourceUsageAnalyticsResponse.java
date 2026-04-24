package com.smartcampus.resource.dto;

import java.util.List;

public record ResourceUsageAnalyticsResponse(
        long totalResources,
        long activeResources,
        long totalBookings,
        List<TopResourceUsageResponse> topResources,
        List<PeakBookingHourResponse> peakBookingHours) {
}

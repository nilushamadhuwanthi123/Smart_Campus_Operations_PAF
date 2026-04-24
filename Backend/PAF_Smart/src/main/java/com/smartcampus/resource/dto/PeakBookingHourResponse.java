package com.smartcampus.resource.dto;

public record PeakBookingHourResponse(
        String hour,
        long bookingCount) {
}

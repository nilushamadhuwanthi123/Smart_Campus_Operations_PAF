package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateResourceBookingRequest(
        @NotBlank(message = "Resource ID is required") String resourceId,
        @NotBlank(message = "Booking date is required") String date,
        @NotBlank(message = "Start time is required") String startTime,
        @NotBlank(message = "End time is required") String endTime,
        @NotBlank(message = "Booking purpose is required")
        @Size(max = 500, message = "Booking purpose cannot exceed 500 characters") String purpose,
        @Positive(message = "Expected attendees must be greater than 0") Integer expectedAttendees) {
}

package com.smartcampus.booking.dto;

import jakarta.validation.constraints.Size;

public record CancelResourceBookingRequest(
        @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters") String reason) {
}

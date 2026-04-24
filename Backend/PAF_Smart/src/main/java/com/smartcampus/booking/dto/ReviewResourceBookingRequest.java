package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewResourceBookingRequest(
        @NotBlank(message = "Review decision is required") String decision,
        @Size(max = 500, message = "Review reason cannot exceed 500 characters") String reason) {
}

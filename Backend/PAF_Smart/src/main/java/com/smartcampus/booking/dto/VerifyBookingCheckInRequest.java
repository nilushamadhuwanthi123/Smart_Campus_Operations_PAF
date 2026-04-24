package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyBookingCheckInRequest(
        @NotBlank(message = "QR payload is required")
        @Size(max = 2000, message = "QR payload is too long") String qrPayload) {
}

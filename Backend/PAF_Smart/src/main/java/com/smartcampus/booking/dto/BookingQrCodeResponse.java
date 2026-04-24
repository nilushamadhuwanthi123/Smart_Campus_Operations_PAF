package com.smartcampus.booking.dto;

import java.time.Instant;

public record BookingQrCodeResponse(
        String bookingId,
        String resourceName,
        String date,
        String startTime,
        String endTime,
        String status,
        Instant checkedInAt,
        String qrPayload,
        String qrCodeImageDataUrl) {
}

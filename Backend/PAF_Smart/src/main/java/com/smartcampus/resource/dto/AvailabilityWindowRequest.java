package com.smartcampus.resource.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AvailabilityWindowRequest(
        @NotBlank(message = "Day of week is required")
        String dayOfWeek,

        @NotBlank(message = "Start time is required")
        @Pattern(regexp = "^(?:[01]\\d|2[0-3]):[0-5]\\d$", message = "Start time must be in HH:mm format")
        String startTime,

        @NotBlank(message = "End time is required")
        @Pattern(regexp = "^(?:[01]\\d|2[0-3]):[0-5]\\d$", message = "End time must be in HH:mm format")
        String endTime) {
}

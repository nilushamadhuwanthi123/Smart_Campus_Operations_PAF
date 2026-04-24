package com.smartcampus.resource.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record UpdateCampusResourceRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must not exceed 120 characters")
        String name,

        @NotBlank(message = "Type is required")
        String type,

        @Min(value = 1, message = "Capacity must be at least 1")
        int capacity,

        @NotBlank(message = "Location is required")
        @Size(max = 140, message = "Location must not exceed 140 characters")
        String location,

        @NotEmpty(message = "At least one availability window is required")
        List<@Valid AvailabilityWindowRequest> availabilityWindows,

        @NotBlank(message = "Status is required")
        String status,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description) {
}

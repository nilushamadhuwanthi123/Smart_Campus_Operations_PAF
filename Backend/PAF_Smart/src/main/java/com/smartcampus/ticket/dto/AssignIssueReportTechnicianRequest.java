package com.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignIssueReportTechnicianRequest(
        @NotBlank(message = "Technician ID is required")
        String technicianId) {
}

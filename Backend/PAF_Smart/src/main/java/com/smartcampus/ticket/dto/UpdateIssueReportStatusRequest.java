package com.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateIssueReportStatusRequest(
        @NotBlank(message = "Status is required")
        String status) {
}

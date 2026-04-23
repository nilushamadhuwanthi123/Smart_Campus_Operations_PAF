package com.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddIssueReportCommentRequest(
        @NotBlank(message = "Comment is required")
        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        String comment) {
}

package com.smartcampus.ticket.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateIssueReportRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title must not exceed 120 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotBlank(message = "Category is required")
        String category,

        @NotBlank(message = "Priority is required")
        String priority,

        String studentId,

        @Size(max = 100, message = "Reporter name must not exceed 100 characters")
        String studentName,

        String studentEmail,

        List<String> attachmentUrls) {
}

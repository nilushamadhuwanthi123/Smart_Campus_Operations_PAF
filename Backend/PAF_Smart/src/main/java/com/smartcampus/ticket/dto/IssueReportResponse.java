package com.smartcampus.ticket.dto;

import java.time.Instant;
import java.util.List;

public record IssueReportResponse(
        String id,
        String title,
        String description,
        String category,
        String priority,
        String status,
        String studentId,
        String studentName,
        String studentEmail,
        String assignedTechnicianId,
        String assignedTechnicianName,
        List<String> attachmentUrls,
        List<IssueCommentResponse> comments,
        String adminNote,
        Instant createdAt,
        Instant updatedAt) {
}

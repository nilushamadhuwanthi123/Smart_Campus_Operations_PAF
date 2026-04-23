package com.smartcampus.ticket.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.smartcampus.ticket.dto.CreateIssueReportRequest;
import com.smartcampus.ticket.dto.IssueReportResponse;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.ticket.entity.IssueReport;
import com.smartcampus.ticket.repository.IssueReportRepository;

@Service
public class IssueReportService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "REJECTED",
            "CLOSED");

    private static final String DEFAULT_REPORTER_ID = "anonymous";
    private static final String DEFAULT_REPORTER_NAME = "Anonymous Reporter";
    private static final String DEFAULT_REPORTER_EMAIL = "anonymous@campus.local";

    private final IssueReportRepository issueReportRepository;

    public IssueReportService(IssueReportRepository issueReportRepository) {
        this.issueReportRepository = issueReportRepository;
    }

    public IssueReportResponse createIssueReport(CreateIssueReportRequest request) {
        Instant now = Instant.now();

        IssueReport issueReport = new IssueReport();
        issueReport.setTitle(request.title().trim());
        issueReport.setDescription(request.description().trim());
        issueReport.setCategory(request.category().trim());
        issueReport.setPriority(request.priority().trim().toUpperCase());
        issueReport.setStatus("OPEN");
        issueReport.setStudentId(optionalOrDefault(request.studentId(), DEFAULT_REPORTER_ID));
        issueReport.setStudentName(optionalOrDefault(request.studentName(), DEFAULT_REPORTER_NAME));
        issueReport.setStudentEmail(optionalOrDefault(request.studentEmail(), DEFAULT_REPORTER_EMAIL));
        issueReport.setAttachmentUrls(request.attachmentUrls() == null ? List.of() : request.attachmentUrls());
        issueReport.setAdminNote(null);
        issueReport.setCreatedAt(now);
        issueReport.setUpdatedAt(now);

        return toResponse(issueReportRepository.save(issueReport));
    }

    public List<IssueReportResponse> getIssueReports(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return getAllIssueReports();
        }

        return issueReportRepository.findByStudentIdOrderByCreatedAtDesc(studentId.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<IssueReportResponse> getAllIssueReports() {
        return issueReportRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(IssueReport::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public IssueReportResponse getIssueReportById(String id) {
        return toResponse(findIssueReportById(id));
    }

    public IssueReportResponse updateIssueReportStatus(String id, String status) {
        IssueReport issueReport = findIssueReportById(id);
        String normalizedStatus = normalizeStatus(status);

        if (issueReport.getStatus().equals(normalizedStatus)) {
            throw new ResourceConflictException("Issue report already has this status");
        }

        issueReport.setStatus(normalizedStatus);
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse updateIssueReportAdminNote(String id, String adminNote) {
        IssueReport issueReport = findIssueReportById(id);
        issueReport.setAdminNote(adminNote.trim());
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    private IssueReport findIssueReportById(String id) {
        return issueReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue report not found"));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResourceConflictException("Issue report status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new ResourceConflictException("Unsupported issue report status");
        }

        return normalizedStatus;
    }

    private String optionalOrDefault(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value.trim();
    }

    private IssueReportResponse toResponse(IssueReport issueReport) {
        return new IssueReportResponse(
                issueReport.getId(),
                issueReport.getTitle(),
                issueReport.getDescription(),
                issueReport.getCategory(),
                issueReport.getPriority(),
                issueReport.getStatus(),
                issueReport.getStudentId(),
                issueReport.getStudentName(),
                issueReport.getStudentEmail(),
                issueReport.getAttachmentUrls(),
                issueReport.getAdminNote(),
                issueReport.getCreatedAt(),
                issueReport.getUpdatedAt());
    }
}

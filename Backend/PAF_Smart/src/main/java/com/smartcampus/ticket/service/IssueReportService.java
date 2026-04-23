package com.smartcampus.ticket.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.UserRole;
import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.auth.service.UserService;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.ticket.dto.CreateIssueReportRequest;
import com.smartcampus.ticket.dto.IssueCommentResponse;
import com.smartcampus.ticket.dto.IssueReportResponse;
import com.smartcampus.ticket.entity.IssueReport;
import com.smartcampus.ticket.entity.IssueReport.IssueComment;
import com.smartcampus.ticket.repository.IssueReportRepository;

@Service
public class IssueReportService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "REJECTED",
            "CLOSED");

    private final IssueReportRepository issueReportRepository;
    private final UserService userService;

    public IssueReportService(IssueReportRepository issueReportRepository, UserService userService) {
        this.issueReportRepository = issueReportRepository;
        this.userService = userService;
    }

    public IssueReportResponse createIssueReport(CreateIssueReportRequest request, AppUserPrincipal principal) {
        Instant now = Instant.now();

        IssueReport issueReport = new IssueReport();
        issueReport.setTitle(request.title().trim());
        issueReport.setDescription(request.description().trim());
        issueReport.setCategory(request.category().trim());
        issueReport.setPriority(request.priority().trim().toUpperCase());
        issueReport.setStatus("OPEN");
        issueReport.setStudentId(principal.getId());
        issueReport.setStudentName(principal.getFullName());
        issueReport.setStudentEmail(principal.getUsername());
        issueReport.setAssignedTechnicianId(null);
        issueReport.setAssignedTechnicianName(null);
        issueReport.setAttachmentUrls(request.attachmentUrls() == null ? List.of() : request.attachmentUrls());
        issueReport.setComments(List.of());
        issueReport.setAdminNote(null);
        issueReport.setCreatedAt(now);
        issueReport.setUpdatedAt(now);

        return toResponse(issueReportRepository.save(issueReport));
    }

    public List<IssueReportResponse> getIssueReports(AppUserPrincipal principal) {
        if (principal.getRole() == UserRole.ADMIN) {
            return getAllIssueReports();
        }

        if (principal.getRole() == UserRole.TECHNICIAN) {
            return issueReportRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(principal.getId())
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        return issueReportRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<IssueReportResponse> getAllIssueReports() {
        return issueReportRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(IssueReport::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toResponse)
                .toList();
    }

    public IssueReportResponse getIssueReportById(String id, AppUserPrincipal principal) {
        IssueReport issueReport = findIssueReportById(id);
        assertCanViewIssue(issueReport, principal);
        return toResponse(issueReport);
    }

    public IssueReportResponse updateIssueReportStatus(String id, String status, AppUserPrincipal principal) {
        IssueReport issueReport = findIssueReportById(id);
        assertCanUpdateStatus(issueReport, principal);

        String normalizedStatus = normalizeStatus(status);

        if (issueReport.getStatus().equals(normalizedStatus)) {
            throw new ResourceConflictException("Issue report already has this status");
        }

        issueReport.setStatus(normalizedStatus);
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse updateIssueReportAdminNote(String id, String adminNote, AppUserPrincipal principal) {
        IssueReport issueReport = findIssueReportById(id);

        if (principal.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can update admin notes");
        }

        issueReport.setAdminNote(adminNote.trim());
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse assignTechnician(String id, String technicianId, AppUserPrincipal principal) {
        IssueReport issueReport = findIssueReportById(id);

        if (principal.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can assign technicians");
        }

        AppUser technician = userService.findTechnicianById(technicianId.trim());

        issueReport.setAssignedTechnicianId(technician.getId());
        issueReport.setAssignedTechnicianName(technician.getFullName());
        if ("OPEN".equals(issueReport.getStatus())) {
            issueReport.setStatus("IN_PROGRESS");
        }
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse addComment(String id, String comment, AppUserPrincipal principal) {
        IssueReport issueReport = findIssueReportById(id);
        assertCanComment(issueReport, principal);

        IssueComment issueComment = new IssueComment();
        issueComment.setId(UUID.randomUUID().toString());
        issueComment.setUserId(principal.getId());
        issueComment.setUserName(principal.getFullName());
        issueComment.setUserRole(principal.getRole().name());
        issueComment.setMessage(comment.trim());
        issueComment.setCreatedAt(Instant.now());

        List<IssueComment> nextComments = issueReport.getComments() == null
                ? new ArrayList<>()
                : new ArrayList<>(issueReport.getComments());
        nextComments.add(issueComment);

        issueReport.setComments(nextComments);
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

    private void assertCanViewIssue(IssueReport issueReport, AppUserPrincipal principal) {
        if (principal.getRole() == UserRole.ADMIN) {
            return;
        }

        if (principal.getRole() == UserRole.STUDENT && principal.getId().equals(issueReport.getStudentId())) {
            return;
        }

        if (principal.getRole() == UserRole.TECHNICIAN && principal.getId().equals(issueReport.getAssignedTechnicianId())) {
            return;
        }

        throw new AccessDeniedException("You do not have access to this ticket");
    }

    private void assertCanUpdateStatus(IssueReport issueReport, AppUserPrincipal principal) {
        if (principal.getRole() == UserRole.ADMIN) {
            return;
        }

        if (principal.getRole() == UserRole.TECHNICIAN && principal.getId().equals(issueReport.getAssignedTechnicianId())) {
            return;
        }

        throw new AccessDeniedException("You do not have access to update ticket status");
    }

    private void assertCanComment(IssueReport issueReport, AppUserPrincipal principal) {
        if (principal.getRole() == UserRole.ADMIN) {
            return;
        }

        if (principal.getRole() == UserRole.STUDENT && principal.getId().equals(issueReport.getStudentId())) {
            return;
        }

        if (principal.getRole() == UserRole.TECHNICIAN && principal.getId().equals(issueReport.getAssignedTechnicianId())) {
            return;
        }

        throw new AccessDeniedException("You do not have access to comment on this ticket");
    }

    private IssueReportResponse toResponse(IssueReport issueReport) {
        List<IssueCommentResponse> commentResponses = issueReport.getComments() == null
                ? List.of()
                : issueReport.getComments().stream()
                        .map(comment -> new IssueCommentResponse(
                                comment.getId(),
                                comment.getUserId(),
                                comment.getUserName(),
                                comment.getUserRole(),
                                comment.getMessage(),
                                comment.getCreatedAt()))
                        .toList();
        List<String> attachmentUrls = issueReport.getAttachmentUrls() == null
                ? List.of()
                : issueReport.getAttachmentUrls();

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
                issueReport.getAssignedTechnicianId(),
                issueReport.getAssignedTechnicianName(),
                attachmentUrls,
                commentResponses,
                issueReport.getAdminNote(),
                issueReport.getCreatedAt(),
                issueReport.getUpdatedAt());
    }
}

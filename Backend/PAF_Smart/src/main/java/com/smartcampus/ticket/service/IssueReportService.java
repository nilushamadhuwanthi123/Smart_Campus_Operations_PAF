package com.smartcampus.ticket.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
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
import com.smartcampus.notification.service.UserNotificationService;
import com.smartcampus.ticket.dto.CreateIssueReportRequest;
import com.smartcampus.ticket.dto.IssueCommentResponse;
import com.smartcampus.ticket.dto.IssueReportResponse;
import com.smartcampus.ticket.entity.IssueReport;
import com.smartcampus.ticket.entity.IssueReport.IssueComment;
import com.smartcampus.ticket.repository.IssueReportRepository;

@Service
public class IssueReportService {

    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_RESOLVED = "RESOLVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CLOSED = "CLOSED";

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            STATUS_OPEN,
            STATUS_IN_PROGRESS,
            STATUS_RESOLVED,
            STATUS_REJECTED,
            STATUS_CLOSED);

    private final IssueReportRepository issueReportRepository;
    private final UserService userService;
    private final UserNotificationService userNotificationService;

    public IssueReportService(
            IssueReportRepository issueReportRepository,
            UserService userService,
            UserNotificationService userNotificationService) {
        this.issueReportRepository = issueReportRepository;
        this.userService = userService;
        this.userNotificationService = userNotificationService;
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

        IssueReport saved = issueReportRepository.save(issueReport);
        createNewTicketNotificationsForAdmins(saved, principal);
        return toResponse(saved);
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

        String previousStatus = issueReport.getStatus();
        issueReport.setStatus(normalizedStatus);
        issueReport.setUpdatedAt(Instant.now());

        IssueReport savedIssueReport = issueReportRepository.save(issueReport);
        createTicketStatusChangeNotification(savedIssueReport, previousStatus, principal);

        return toResponse(savedIssueReport);
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

        String previousTechnicianId = issueReport.getAssignedTechnicianId();
        String previousStatus = issueReport.getStatus();

        issueReport.setAssignedTechnicianId(technician.getId());
        issueReport.setAssignedTechnicianName(technician.getFullName());
        if (STATUS_OPEN.equals(issueReport.getStatus())) {
            issueReport.setStatus(STATUS_IN_PROGRESS);
        }
        issueReport.setUpdatedAt(Instant.now());

        IssueReport savedIssueReport = issueReportRepository.save(issueReport);

        if (!Objects.equals(previousStatus, savedIssueReport.getStatus())) {
            createTicketStatusChangeNotification(savedIssueReport, previousStatus, principal);
        }

        String normalizedPreviousTechnicianId = previousTechnicianId == null || previousTechnicianId.isBlank()
                ? null
                : previousTechnicianId.trim();

        if (savedIssueReport.getAssignedTechnicianId() != null
                && !savedIssueReport.getAssignedTechnicianId().isBlank()
                && !Objects.equals(normalizedPreviousTechnicianId, savedIssueReport.getAssignedTechnicianId())) {
            createTechnicianAssignmentNotification(savedIssueReport, principal);
        }

        return toResponse(savedIssueReport);
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

        IssueReport savedIssueReport = issueReportRepository.save(issueReport);
        createTicketCommentNotification(savedIssueReport, issueComment);

        return toResponse(savedIssueReport);
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

    private void createTechnicianAssignmentNotification(IssueReport issueReport, AppUserPrincipal assignedBy) {
        String technicianId = issueReport.getAssignedTechnicianId();
        if (technicianId == null || technicianId.isBlank()) {
            return;
        }

        String ticketTitle = normalizeTicketTitle(issueReport.getTitle());
        String assigner = assignedBy.getFullName() == null || assignedBy.getFullName().isBlank()
                ? "An admin"
                : assignedBy.getFullName().trim();
        String priorityText = issueReport.getPriority() == null || issueReport.getPriority().isBlank()
                ? "unspecified"
                : issueReport.getPriority().trim();

        String message = String.format(
                "%s assigned you to ticket \"%s\" (priority: %s).",
                assigner,
                ticketTitle,
                priorityText);

        userNotificationService.createNotificationForUser(
                technicianId,
                "Ticket assigned to you",
                message,
                "INFO",
                "/tickets/" + issueReport.getId());
    }

    private void createNewTicketNotificationsForAdmins(IssueReport issueReport, AppUserPrincipal createdBy) {
        String ticketTitle = normalizeTicketTitle(issueReport.getTitle());
        String priorityText = issueReport.getPriority() == null || issueReport.getPriority().isBlank()
                ? "unspecified"
                : issueReport.getPriority().trim();
        String message = String.format(
                "New ticket submitted: \"%s\" (category: %s, priority: %s).",
                ticketTitle,
                issueReport.getCategory() == null || issueReport.getCategory().isBlank()
                        ? "general"
                        : issueReport.getCategory().trim(),
                priorityText);

        for (String adminId : userService.getUserIdsByRole(UserRole.ADMIN)) {
            if (adminId.equals(createdBy.getId())) {
                continue;
            }
            userNotificationService.createNotificationForUser(
                    adminId,
                    "New Support Ticket",
                    message,
                    "INFO",
                    "/tickets/" + issueReport.getId());
        }
    }

    private void createTicketStatusChangeNotification(
            IssueReport issueReport,
            String previousStatus,
            AppUserPrincipal actor) {
        if (issueReport.getStudentId() == null
                || issueReport.getStudentId().isBlank()
                || issueReport.getStudentId().equals(actor.getId())) {
            return;
        }

        String ticketTitle = normalizeTicketTitle(issueReport.getTitle());
        String message = String.format(
                "Ticket \"%s\" changed from %s to %s.",
                ticketTitle,
                formatStatus(previousStatus),
                formatStatus(issueReport.getStatus()));

        userNotificationService.createNotificationForUser(
                issueReport.getStudentId(),
                "Ticket Status Updated",
                message,
                isClosedOrResolved(issueReport.getStatus()) ? "SUCCESS" : "INFO",
                "/tickets/" + issueReport.getId());
    }

    private void createTicketCommentNotification(IssueReport issueReport, IssueComment issueComment) {
        Set<String> recipients = new LinkedHashSet<>();

        if (issueReport.getStudentId() != null
                && !issueReport.getStudentId().isBlank()
                && !issueReport.getStudentId().equals(issueComment.getUserId())) {
            recipients.add(issueReport.getStudentId());
        }

        if (issueReport.getAssignedTechnicianId() != null
                && !issueReport.getAssignedTechnicianId().isBlank()
                && !issueReport.getAssignedTechnicianId().equals(issueComment.getUserId())) {
            recipients.add(issueReport.getAssignedTechnicianId());
        }

        if (recipients.isEmpty()) {
            return;
        }

        String ticketTitle = normalizeTicketTitle(issueReport.getTitle());
        String commentAuthor = issueComment.getUserName() == null || issueComment.getUserName().isBlank()
                ? "A user"
                : issueComment.getUserName().trim();
        String message = commentAuthor + " commented on ticket \"" + ticketTitle + "\".";

        for (String recipientId : recipients) {
            userNotificationService.createNotificationForUser(
                    recipientId,
                    "New Ticket Comment",
                    message,
                    "INFO",
                    "/tickets/" + issueReport.getId());
        }
    }

    private boolean isClosedOrResolved(String status) {
        return STATUS_CLOSED.equals(status) || STATUS_RESOLVED.equals(status);
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "UNKNOWN";
        }

        return status.replace('_', ' ');
    }

    private String normalizeTicketTitle(String title) {
        if (title == null || title.isBlank()) {
            return "Untitled ticket";
        }

        return title.trim();
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

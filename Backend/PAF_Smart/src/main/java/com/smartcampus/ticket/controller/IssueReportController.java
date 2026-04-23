package com.smartcampus.ticket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.ticket.dto.AddIssueReportCommentRequest;
import com.smartcampus.ticket.dto.AssignIssueReportTechnicianRequest;
import com.smartcampus.ticket.dto.CreateIssueReportRequest;
import com.smartcampus.ticket.dto.IssueReportResponse;
import com.smartcampus.ticket.dto.UpdateIssueReportNoteRequest;
import com.smartcampus.ticket.dto.UpdateIssueReportStatusRequest;
import com.smartcampus.ticket.service.IssueReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/issues")
public class IssueReportController {

    private final IssueReportService issueReportService;

    public IssueReportController(IssueReportService issueReportService) {
        this.issueReportService = issueReportService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueReportResponse createIssueReport(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody CreateIssueReportRequest request) {
        return issueReportService.createIssueReport(request, principal);
    }

    @GetMapping
    public List<IssueReportResponse> getIssueReports(@AuthenticationPrincipal AppUserPrincipal principal) {
        return issueReportService.getIssueReports(principal);
    }

    @GetMapping("/{id}")
    public IssueReportResponse getIssueReportById(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return issueReportService.getIssueReportById(id, principal);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public IssueReportResponse updateIssueReportStatus(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody UpdateIssueReportStatusRequest request) {
        return issueReportService.updateIssueReportStatus(id, request.status(), principal);
    }

    @PatchMapping("/{id}/note")
    @PreAuthorize("hasRole('ADMIN')")
    public IssueReportResponse updateIssueReportAdminNote(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody UpdateIssueReportNoteRequest request) {
        return issueReportService.updateIssueReportAdminNote(id, request.adminNote(), principal);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public IssueReportResponse assignTechnician(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody AssignIssueReportTechnicianRequest request) {
        return issueReportService.assignTechnician(id, request.technicianId(), principal);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'TECHNICIAN')")
    public IssueReportResponse addComment(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody AddIssueReportCommentRequest request) {
        return issueReportService.addComment(id, request.comment(), principal);
    }
}

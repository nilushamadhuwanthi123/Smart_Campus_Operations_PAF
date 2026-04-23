package com.smartcampus.ticket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
    @ResponseStatus(HttpStatus.CREATED)
    public IssueReportResponse createIssueReport(@Valid @RequestBody CreateIssueReportRequest request) {
        return issueReportService.createIssueReport(request);
    }

    @GetMapping
    public List<IssueReportResponse> getIssueReports(@RequestParam(required = false) String studentId) {
        return issueReportService.getIssueReports(studentId);
    }

    @GetMapping("/{id}")
    public IssueReportResponse getIssueReportById(@PathVariable String id) {
        return issueReportService.getIssueReportById(id);
    }

    @PatchMapping("/{id}/status")
    public IssueReportResponse updateIssueReportStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateIssueReportStatusRequest request) {
        return issueReportService.updateIssueReportStatus(id, request.status());
    }

    @PatchMapping("/{id}/note")
    public IssueReportResponse updateIssueReportAdminNote(
            @PathVariable String id,
            @Valid @RequestBody UpdateIssueReportNoteRequest request) {
        return issueReportService.updateIssueReportAdminNote(id, request.adminNote());
    }
}

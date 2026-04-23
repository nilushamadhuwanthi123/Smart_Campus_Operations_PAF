package com.smartcampus.ticket.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.ticket.entity.IssueReport;

public interface IssueReportRepository extends MongoRepository<IssueReport, String> {

    List<IssueReport> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<IssueReport> findByAssignedTechnicianIdOrderByCreatedAtDesc(String assignedTechnicianId);
}

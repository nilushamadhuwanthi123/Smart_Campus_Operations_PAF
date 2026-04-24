package com.smartcampus.resource.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.resource.dto.CampusResourceResponse;
import com.smartcampus.resource.dto.CreateCampusResourceRequest;
import com.smartcampus.resource.dto.ResourceUsageAnalyticsResponse;
import com.smartcampus.resource.dto.UpdateCampusResourceRequest;
import com.smartcampus.resource.service.CampusResourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class CampusResourceController {

    private final CampusResourceService campusResourceService;

    public CampusResourceController(CampusResourceService campusResourceService) {
        this.campusResourceService = campusResourceService;
    }

    @GetMapping
    public List<CampusResourceResponse> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return campusResourceService.getResources(type, minCapacity, maxCapacity, location, status, search);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceUsageAnalyticsResponse getResourceUsageAnalytics() {
        return campusResourceService.getResourceUsageAnalytics();
    }

    @GetMapping("/{id}")
    public CampusResourceResponse getResourceById(@PathVariable String id) {
        return campusResourceService.getResourceById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CampusResourceResponse createResource(@Valid @RequestBody CreateCampusResourceRequest request) {
        return campusResourceService.createResource(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CampusResourceResponse updateResource(
            @PathVariable String id,
            @Valid @RequestBody UpdateCampusResourceRequest request) {
        return campusResourceService.updateResource(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResource(@PathVariable String id) {
        campusResourceService.deleteResource(id);
    }
}

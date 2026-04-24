package com.smartcampus.booking.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.booking.dto.BookingQrCodeResponse;
import com.smartcampus.booking.dto.CancelResourceBookingRequest;
import com.smartcampus.booking.dto.CreateResourceBookingRequest;
import com.smartcampus.booking.dto.ResourceBookingResponse;
import com.smartcampus.booking.dto.ReviewResourceBookingRequest;
import com.smartcampus.booking.dto.VerifyBookingCheckInRequest;
import com.smartcampus.booking.service.ResourceBookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class ResourceBookingController {

    private final ResourceBookingService resourceBookingService;

    public ResourceBookingController(ResourceBookingService resourceBookingService) {
        this.resourceBookingService = resourceBookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceBookingResponse createBooking(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody CreateResourceBookingRequest request) {
        return resourceBookingService.createBooking(request, principal);
    }

    @GetMapping
    public List<ResourceBookingResponse> getBookings(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String bookedByUserId) {
        return resourceBookingService.getBookings(
                principal,
                status,
                resourceId,
                dateFrom,
                dateTo,
                search,
                bookedByUserId);
    }

    @GetMapping("/{id}")
    public ResourceBookingResponse getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return resourceBookingService.getBookingById(id, principal);
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceBookingResponse reviewBooking(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody ReviewResourceBookingRequest request) {
        return resourceBookingService.reviewBooking(id, request, principal);
    }

    @PatchMapping("/{id}/cancel")
    public ResourceBookingResponse cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestBody(required = false) CancelResourceBookingRequest request) {
        return resourceBookingService.cancelBooking(id, request, principal);
    }

    @GetMapping("/{id}/qr")
    public BookingQrCodeResponse getBookingQrCode(
            @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return resourceBookingService.getBookingQrCode(id, principal);
    }

    @PostMapping("/check-in/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceBookingResponse verifyBookingCheckIn(
            @Valid @RequestBody VerifyBookingCheckInRequest request) {
        return resourceBookingService.verifyAndCheckIn(request);
    }
}

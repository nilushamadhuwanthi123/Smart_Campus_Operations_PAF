package com.smartcampus.booking.service;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.smartcampus.auth.entity.UserRole;
import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.booking.dto.BookingQrCodeResponse;
import com.smartcampus.booking.dto.CancelResourceBookingRequest;
import com.smartcampus.booking.dto.CreateResourceBookingRequest;
import com.smartcampus.booking.dto.ResourceBookingResponse;
import com.smartcampus.booking.dto.ReviewResourceBookingRequest;
import com.smartcampus.booking.dto.VerifyBookingCheckInRequest;
import com.smartcampus.booking.entity.ResourceBooking;
import com.smartcampus.booking.repository.ResourceBookingRepository;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.resource.entity.CampusResource;
import com.smartcampus.resource.repository.CampusResourceRepository;

@Service
public class ResourceBookingService {

    private static final ZoneId CAMPUS_ZONE = ZoneId.systemDefault();

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            STATUS_PENDING,
            STATUS_APPROVED,
            STATUS_REJECTED,
            STATUS_CANCELLED);

    private static final Set<String> REVIEW_DECISIONS = Set.of(
            STATUS_APPROVED,
            STATUS_REJECTED);

    private static final List<String> CONFLICT_BLOCKING_STATUSES = List.of(
            STATUS_PENDING,
            STATUS_APPROVED);

    private static final String QR_PAYLOAD_PREFIX = "SMART_CAMPUS_BOOKING";

    private final ResourceBookingRepository resourceBookingRepository;
    private final CampusResourceRepository campusResourceRepository;

    public ResourceBookingService(
            ResourceBookingRepository resourceBookingRepository,
            CampusResourceRepository campusResourceRepository) {
        this.resourceBookingRepository = resourceBookingRepository;
        this.campusResourceRepository = campusResourceRepository;
    }

    public ResourceBookingResponse createBooking(CreateResourceBookingRequest request, AppUserPrincipal principal) {
        CampusResource resource = findResourceById(request.resourceId());

        if (!"ACTIVE".equals(resource.getStatus())) {
            throw new ResourceConflictException("Selected resource is not currently active");
        }

        BookingSchedule schedule = parseSchedule(request.date(), request.startTime(), request.endTime());
        assertBookingDateNotInPast(schedule.date());
        validateExpectedAttendees(resource, request.expectedAttendees());

        if (hasSchedulingConflict(resource.getId(), schedule.startInstant(), schedule.endInstant(), null)) {
            throw new ResourceConflictException("This resource is already booked for the selected time range");
        }

        Instant now = Instant.now();

        ResourceBooking booking = new ResourceBooking();
        booking.setResourceId(resource.getId());
        booking.setResourceName(resource.getName());
        booking.setResourceType(resource.getType());
        booking.setResourceLocation(resource.getLocation());

        booking.setBookedByUserId(principal.getId());
        booking.setBookedByUserName(principal.getFullName());
        booking.setBookedByUserEmail(principal.getUsername());

        booking.setStartTime(schedule.startInstant());
        booking.setEndTime(schedule.endInstant());
        booking.setPurpose(normalizeRequiredText(request.purpose(), "Booking purpose is required"));
        booking.setExpectedAttendees(request.expectedAttendees());

        booking.setStatus(STATUS_PENDING);
        booking.setAdminReviewReason(null);
        booking.setReviewedByUserId(null);
        booking.setReviewedByUserName(null);
        booking.setReviewedAt(null);

        booking.setCancellationReason(null);
        booking.setCancelledAt(null);

        booking.setCheckInToken(null);
        booking.setCheckedInAt(null);

        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);

        return toResponse(resourceBookingRepository.save(booking));
    }

    public List<ResourceBookingResponse> getBookings(
            AppUserPrincipal principal,
            String status,
            String resourceId,
            String dateFrom,
            String dateTo,
            String search,
            String bookedByUserId) {
        boolean isAdmin = principal.getRole() == UserRole.ADMIN;

        String normalizedStatus = normalizeStatusFilter(status);
        String normalizedResourceId = normalizeOptionalText(resourceId);
        String normalizedSearch = normalizeFilterValue(search);

        String normalizedBookedByUserId = isAdmin
                ? normalizeOptionalText(bookedByUserId)
                : principal.getId();

        LocalDate normalizedDateFrom = normalizeDateFilter(dateFrom, "dateFrom");
        LocalDate normalizedDateTo = normalizeDateFilter(dateTo, "dateTo");

        if (normalizedDateFrom != null && normalizedDateTo != null && normalizedDateFrom.isAfter(normalizedDateTo)) {
            throw new ResourceConflictException("dateFrom cannot be later than dateTo");
        }

        Instant fromInstant = normalizedDateFrom == null
                ? null
                : normalizedDateFrom.atStartOfDay(CAMPUS_ZONE).toInstant();

        Instant toInstantExclusive = normalizedDateTo == null
                ? null
                : normalizedDateTo.plusDays(1).atStartOfDay(CAMPUS_ZONE).toInstant();

        List<ResourceBooking> baseBookings = isAdmin
                ? resourceBookingRepository.findAll()
                : resourceBookingRepository.findByBookedByUserIdOrderByCreatedAtDesc(principal.getId());

        return baseBookings.stream()
                .filter(booking -> normalizedBookedByUserId == null
                        || normalizedBookedByUserId.equals(booking.getBookedByUserId()))
                .filter(booking -> normalizedStatus == null || normalizedStatus.equals(booking.getStatus()))
                .filter(booking -> normalizedResourceId == null || normalizedResourceId.equals(booking.getResourceId()))
                .filter(booking -> fromInstant == null
                        || (booking.getStartTime() != null && !booking.getStartTime().isBefore(fromInstant)))
                .filter(booking -> toInstantExclusive == null
                        || (booking.getStartTime() != null && booking.getStartTime().isBefore(toInstantExclusive)))
                .filter(booking -> matchesSearch(booking, normalizedSearch))
                .sorted(Comparator.comparing(ResourceBooking::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toResponse)
                .toList();
    }

    public ResourceBookingResponse getBookingById(String id, AppUserPrincipal principal) {
        ResourceBooking booking = findBookingById(id);
        assertCanViewBooking(booking, principal);
        return toResponse(booking);
    }

    public ResourceBookingResponse reviewBooking(
            String id,
            ReviewResourceBookingRequest request,
            AppUserPrincipal principal) {
        ResourceBooking booking = findBookingById(id);

        if (principal.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can review bookings");
        }

        if (!STATUS_PENDING.equals(booking.getStatus())) {
            throw new ResourceConflictException("Only pending bookings can be reviewed");
        }

        String decision = normalizeReviewDecision(request.decision());

        if (STATUS_APPROVED.equals(decision)) {
            if (hasSchedulingConflict(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), booking.getId())) {
                throw new ResourceConflictException("This resource is already booked for the selected time range");
            }

            booking.setStatus(STATUS_APPROVED);
            booking.setAdminReviewReason(normalizeOptionalText(request.reason()));

            if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
                booking.setCheckInToken(UUID.randomUUID().toString());
            }
        } else {
            String reason = normalizeRequiredText(request.reason(), "Rejection reason is required");
            booking.setStatus(STATUS_REJECTED);
            booking.setAdminReviewReason(reason);
            booking.setCheckInToken(null);
        }

        Instant now = Instant.now();
        booking.setReviewedByUserId(principal.getId());
        booking.setReviewedByUserName(principal.getFullName());
        booking.setReviewedAt(now);
        booking.setUpdatedAt(now);

        return toResponse(resourceBookingRepository.save(booking));
    }

    public ResourceBookingResponse cancelBooking(
            String id,
            CancelResourceBookingRequest request,
            AppUserPrincipal principal) {
        ResourceBooking booking = findBookingById(id);
        assertCanCancelBooking(booking, principal);

        if (!STATUS_APPROVED.equals(booking.getStatus())) {
            throw new ResourceConflictException("Only approved bookings can be cancelled");
        }

        Instant now = Instant.now();

        booking.setStatus(STATUS_CANCELLED);
        booking.setCancellationReason(request == null ? null : normalizeOptionalText(request.reason()));
        booking.setCancelledAt(now);
        booking.setCheckInToken(null);
        booking.setUpdatedAt(now);

        return toResponse(resourceBookingRepository.save(booking));
    }

    public BookingQrCodeResponse getBookingQrCode(String id, AppUserPrincipal principal) {
        ResourceBooking booking = findBookingById(id);
        assertCanViewBooking(booking, principal);

        if (!STATUS_APPROVED.equals(booking.getStatus())) {
            throw new ResourceConflictException("QR code is only available for approved bookings");
        }

        String checkInToken = ensureCheckInToken(booking);
        String payload = buildQrPayload(booking.getId(), checkInToken);

        LocalDate bookingDate = booking.getStartTime() == null
                ? null
                : booking.getStartTime().atZone(CAMPUS_ZONE).toLocalDate();

        LocalTime bookingStartTime = booking.getStartTime() == null
                ? null
                : booking.getStartTime().atZone(CAMPUS_ZONE).toLocalTime();

        LocalTime bookingEndTime = booking.getEndTime() == null
                ? null
                : booking.getEndTime().atZone(CAMPUS_ZONE).toLocalTime();

        return new BookingQrCodeResponse(
                booking.getId(),
                booking.getResourceName(),
                bookingDate == null ? null : bookingDate.format(DATE_FORMATTER),
                bookingStartTime == null ? null : bookingStartTime.format(TIME_FORMATTER),
                bookingEndTime == null ? null : bookingEndTime.format(TIME_FORMATTER),
                booking.getStatus(),
                booking.getCheckedInAt(),
                payload,
                toQrCodeDataUrl(payload));
    }

    public ResourceBookingResponse verifyAndCheckIn(VerifyBookingCheckInRequest request) {
        QrPayload qrPayload = parseQrPayload(request.qrPayload());

        ResourceBooking booking = resourceBookingRepository
                .findByIdAndCheckInToken(qrPayload.bookingId(), qrPayload.checkInToken())
                .orElseThrow(() -> new ResourceConflictException("Invalid or expired QR payload"));

        if (!STATUS_APPROVED.equals(booking.getStatus())) {
            throw new ResourceConflictException("Only approved bookings can be checked in");
        }

        if (booking.getCheckedInAt() != null) {
            return toResponse(booking);
        }

        Instant now = Instant.now();
        booking.setCheckedInAt(now);
        booking.setUpdatedAt(now);

        return toResponse(resourceBookingRepository.save(booking));
    }

    private ResourceBooking findBookingById(String id) {
        return resourceBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private CampusResource findResourceById(String id) {
        return campusResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    private void validateExpectedAttendees(CampusResource resource, Integer expectedAttendees) {
        if (expectedAttendees == null) {
            return;
        }

        if (expectedAttendees < 1) {
            throw new ResourceConflictException("Expected attendees must be greater than 0");
        }

        if (resource.getCapacity() > 0 && expectedAttendees > resource.getCapacity()) {
            throw new ResourceConflictException("Expected attendees cannot exceed resource capacity");
        }
    }

    private void assertBookingDateNotInPast(LocalDate bookingDate) {
        LocalDate today = LocalDate.now(CAMPUS_ZONE);

        if (bookingDate.isBefore(today)) {
            throw new ResourceConflictException("Booking date cannot be in the past");
        }
    }

    private void assertCanViewBooking(ResourceBooking booking, AppUserPrincipal principal) {
        if (principal.getRole() == UserRole.ADMIN) {
            return;
        }

        if (principal.getId().equals(booking.getBookedByUserId())) {
            return;
        }

        throw new AccessDeniedException("You do not have access to this booking");
    }

    private void assertCanCancelBooking(ResourceBooking booking, AppUserPrincipal principal) {
        if (principal.getRole() == UserRole.ADMIN) {
            return;
        }

        if (principal.getId().equals(booking.getBookedByUserId())) {
            return;
        }

        throw new AccessDeniedException("You do not have access to cancel this booking");
    }

    private BookingSchedule parseSchedule(String date, String startTime, String endTime) {
        LocalDate bookingDate = parseDate(date, "Booking date is required");
        LocalTime bookingStartTime = parseTime(startTime, "Start time is required");
        LocalTime bookingEndTime = parseTime(endTime, "End time is required");

        if (!bookingStartTime.isBefore(bookingEndTime)) {
            throw new ResourceConflictException("Start time must be before end time");
        }

        Instant startInstant = bookingDate
                .atTime(bookingStartTime)
                .atZone(CAMPUS_ZONE)
                .toInstant();

        Instant endInstant = bookingDate
                .atTime(bookingEndTime)
                .atZone(CAMPUS_ZONE)
                .toInstant();

        return new BookingSchedule(bookingDate, bookingStartTime, bookingEndTime, startInstant, endInstant);
    }

    private LocalDate parseDate(String date, String requiredMessage) {
        if (date == null || date.isBlank()) {
            throw new ResourceConflictException(requiredMessage);
        }

        try {
            return LocalDate.parse(date.trim(), DATE_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new ResourceConflictException("Date must be in yyyy-MM-dd format");
        }
    }

    private LocalTime parseTime(String time, String requiredMessage) {
        if (time == null || time.isBlank()) {
            throw new ResourceConflictException(requiredMessage);
        }

        String normalizedTime = time.trim();

        if (!normalizedTime.matches("^(?:[01]\\d|2[0-3]):[0-5]\\d$")) {
            throw new ResourceConflictException("Time must be in HH:mm format");
        }

        try {
            return LocalTime.parse(normalizedTime, TIME_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new ResourceConflictException("Time must be in HH:mm format");
        }
    }

    private String normalizeStatusFilter(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new ResourceConflictException("Unsupported booking status filter");
        }

        return normalizedStatus;
    }

    private String normalizeReviewDecision(String decision) {
        if (decision == null || decision.isBlank()) {
            throw new ResourceConflictException("Review decision is required");
        }

        String normalizedDecision = decision.trim().toUpperCase(Locale.ROOT);

        if (!REVIEW_DECISIONS.contains(normalizedDecision)) {
            throw new ResourceConflictException("Review decision must be APPROVED or REJECTED");
        }

        return normalizedDecision;
    }

    private String normalizeRequiredText(String value, String requiredMessage) {
        if (value == null || value.isBlank()) {
            throw new ResourceConflictException(requiredMessage);
        }

        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizeFilterValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase(Locale.ROOT);
    }

    private LocalDate normalizeDateFilter(String value, String label) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value.trim(), DATE_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new ResourceConflictException(label + " must be in yyyy-MM-dd format");
        }
    }

    private boolean hasSchedulingConflict(String resourceId, Instant startTime, Instant endTime, String excludeBookingId) {
        List<ResourceBooking> overlappingBookings = resourceBookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        CONFLICT_BLOCKING_STATUSES,
                        endTime,
                        startTime);

        return overlappingBookings.stream()
                .anyMatch(booking -> excludeBookingId == null || !excludeBookingId.equals(booking.getId()));
    }

    private boolean matchesSearch(ResourceBooking booking, String normalizedSearch) {
        if (normalizedSearch == null) {
            return true;
        }

        String purpose = booking.getPurpose() == null
                ? ""
                : booking.getPurpose().toUpperCase(Locale.ROOT);

        String resourceName = booking.getResourceName() == null
                ? ""
                : booking.getResourceName().toUpperCase(Locale.ROOT);

        String bookedByUserName = booking.getBookedByUserName() == null
                ? ""
                : booking.getBookedByUserName().toUpperCase(Locale.ROOT);

        String bookedByUserEmail = booking.getBookedByUserEmail() == null
                ? ""
                : booking.getBookedByUserEmail().toUpperCase(Locale.ROOT);

        return purpose.contains(normalizedSearch)
                || resourceName.contains(normalizedSearch)
                || bookedByUserName.contains(normalizedSearch)
                || bookedByUserEmail.contains(normalizedSearch);
    }

    private String ensureCheckInToken(ResourceBooking booking) {
        if (booking.getCheckInToken() != null && !booking.getCheckInToken().isBlank()) {
            return booking.getCheckInToken();
        }

        booking.setCheckInToken(UUID.randomUUID().toString());
        booking.setUpdatedAt(Instant.now());
        resourceBookingRepository.save(booking);

        return booking.getCheckInToken();
    }

    private String buildQrPayload(String bookingId, String checkInToken) {
        return String.format(
                Locale.ROOT,
                "%s::%s::%s",
                QR_PAYLOAD_PREFIX,
                bookingId,
                checkInToken);
    }

    private QrPayload parseQrPayload(String qrPayloadValue) {
        if (qrPayloadValue == null || qrPayloadValue.isBlank()) {
            throw new ResourceConflictException("QR payload is required");
        }

        String[] parts = qrPayloadValue.trim().split("::");

        if (parts.length != 3 || !QR_PAYLOAD_PREFIX.equals(parts[0])) {
            throw new ResourceConflictException("Invalid or expired QR payload");
        }

        String bookingId = parts[1].trim();
        String checkInToken = parts[2].trim();

        if (bookingId.isEmpty() || checkInToken.isEmpty()) {
            throw new ResourceConflictException("Invalid or expired QR payload");
        }

        return new QrPayload(bookingId, checkInToken);
    }

    private String toQrCodeDataUrl(String payload) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(payload, BarcodeFormat.QR_CODE, 280, 280);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(MatrixToImageWriter.toBufferedImage(bitMatrix), "PNG", outputStream);

            String base64 = Base64.getEncoder().encodeToString(outputStream.toByteArray());
            return "data:image/png;base64," + base64;
        } catch (WriterException | java.io.IOException exception) {
            throw new ResourceConflictException("Failed to generate booking QR code");
        }
    }

    private ResourceBookingResponse toResponse(ResourceBooking booking) {
        LocalDate bookingDate = booking.getStartTime() == null
                ? null
                : booking.getStartTime().atZone(CAMPUS_ZONE).toLocalDate();

        LocalTime bookingStartTime = booking.getStartTime() == null
                ? null
                : booking.getStartTime().atZone(CAMPUS_ZONE).toLocalTime();

        LocalTime bookingEndTime = booking.getEndTime() == null
                ? null
                : booking.getEndTime().atZone(CAMPUS_ZONE).toLocalTime();

        return new ResourceBookingResponse(
                booking.getId(),
                booking.getResourceId(),
                booking.getResourceName(),
                booking.getResourceType(),
                booking.getResourceLocation(),
                booking.getBookedByUserId(),
                booking.getBookedByUserName(),
                booking.getBookedByUserEmail(),
                bookingDate == null ? null : bookingDate.format(DATE_FORMATTER),
                bookingStartTime == null ? null : bookingStartTime.format(TIME_FORMATTER),
                bookingEndTime == null ? null : bookingEndTime.format(TIME_FORMATTER),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus(),
                booking.getAdminReviewReason(),
                booking.getReviewedByUserId(),
                booking.getReviewedByUserName(),
                booking.getReviewedAt(),
                booking.getCancellationReason(),
                booking.getCancelledAt(),
                booking.getCheckedInAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }

    private record BookingSchedule(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Instant startInstant,
            Instant endInstant) {
    }

    private record QrPayload(String bookingId, String checkInToken) {
    }
}

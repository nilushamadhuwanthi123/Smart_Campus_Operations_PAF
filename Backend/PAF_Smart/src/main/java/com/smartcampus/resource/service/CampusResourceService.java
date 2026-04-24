package com.smartcampus.resource.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.smartcampus.booking.entity.ResourceBooking;
import com.smartcampus.booking.repository.ResourceBookingRepository;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.resource.dto.AvailabilityWindowRequest;
import com.smartcampus.resource.dto.AvailabilityWindowResponse;
import com.smartcampus.resource.dto.CampusResourceResponse;
import com.smartcampus.resource.dto.CreateCampusResourceRequest;
import com.smartcampus.resource.dto.PeakBookingHourResponse;
import com.smartcampus.resource.dto.ResourceUsageAnalyticsResponse;
import com.smartcampus.resource.dto.TopResourceUsageResponse;
import com.smartcampus.resource.dto.UpdateCampusResourceRequest;
import com.smartcampus.resource.entity.CampusResource;
import com.smartcampus.resource.entity.CampusResource.AvailabilityWindow;
import com.smartcampus.resource.repository.CampusResourceRepository;

@Service
public class CampusResourceService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "LECTURE_HALL",
            "LAB",
            "MEETING_ROOM",
            "EQUIPMENT");

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "ACTIVE",
            "OUT_OF_SERVICE",
            "MAINTENANCE");

    private static final Set<String> ALLOWED_DAYS = Set.of(
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY");

    private static final Set<String> EXCLUDED_BOOKING_STATUSES = Set.of(
            "REJECTED",
            "CANCELLED");

    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("HH:00");

    private final CampusResourceRepository campusResourceRepository;
    private final ResourceBookingRepository resourceBookingRepository;

    public CampusResourceService(
            CampusResourceRepository campusResourceRepository,
            ResourceBookingRepository resourceBookingRepository) {
        this.campusResourceRepository = campusResourceRepository;
        this.resourceBookingRepository = resourceBookingRepository;
    }

    public CampusResourceResponse createResource(CreateCampusResourceRequest request) {
        String normalizedName = normalizeRequiredText(request.name(), "Resource name is required");
        String normalizedLocation = normalizeRequiredText(request.location(), "Resource location is required");

        if (campusResourceRepository.existsByNameIgnoreCaseAndLocationIgnoreCase(normalizedName, normalizedLocation)) {
            throw new ResourceConflictException("A resource with this name and location already exists");
        }

        Instant now = Instant.now();

        CampusResource resource = new CampusResource();
        resource.setName(normalizedName);
        resource.setType(normalizeType(request.type()));
        resource.setCapacity(request.capacity());
        resource.setLocation(normalizedLocation);
        resource.setAvailabilityWindows(normalizeAvailabilityWindows(request.availabilityWindows()));
        resource.setStatus(normalizeStatus(request.status()));
        resource.setDescription(normalizeOptionalText(request.description()));
        resource.setCreatedAt(now);
        resource.setUpdatedAt(now);

        return toResponse(campusResourceRepository.save(resource));
    }

    public CampusResourceResponse updateResource(String id, UpdateCampusResourceRequest request) {
        CampusResource resource = findResourceById(id);

        String normalizedName = normalizeRequiredText(request.name(), "Resource name is required");
        String normalizedLocation = normalizeRequiredText(request.location(), "Resource location is required");

        if (campusResourceRepository.existsByNameIgnoreCaseAndLocationIgnoreCaseAndIdNot(normalizedName, normalizedLocation, id)) {
            throw new ResourceConflictException("A resource with this name and location already exists");
        }

        resource.setName(normalizedName);
        resource.setType(normalizeType(request.type()));
        resource.setCapacity(request.capacity());
        resource.setLocation(normalizedLocation);
        resource.setAvailabilityWindows(normalizeAvailabilityWindows(request.availabilityWindows()));
        resource.setStatus(normalizeStatus(request.status()));
        resource.setDescription(normalizeOptionalText(request.description()));
        resource.setUpdatedAt(Instant.now());

        return toResponse(campusResourceRepository.save(resource));
    }

    public void deleteResource(String id) {
        CampusResource resource = findResourceById(id);
        campusResourceRepository.delete(resource);
    }

    public CampusResourceResponse getResourceById(String id) {
        return toResponse(findResourceById(id));
    }

    public List<CampusResourceResponse> getResources(
            String type,
            Integer minCapacity,
            Integer maxCapacity,
            String location,
            String status,
            String search) {
        String normalizedType = normalizeFilterValue(type);
        String normalizedStatus = normalizeFilterValue(status);
        String normalizedLocation = normalizeFilterValue(location);
        String normalizedSearch = normalizeFilterValue(search);

        if (normalizedType != null && !ALLOWED_TYPES.contains(normalizedType)) {
            throw new ResourceConflictException("Unsupported resource type filter");
        }

        if (normalizedStatus != null && !ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new ResourceConflictException("Unsupported resource status filter");
        }

        if (minCapacity != null && minCapacity < 1) {
            throw new ResourceConflictException("Minimum capacity must be at least 1");
        }

        if (maxCapacity != null && maxCapacity < 1) {
            throw new ResourceConflictException("Maximum capacity must be at least 1");
        }

        if (minCapacity != null && maxCapacity != null && minCapacity > maxCapacity) {
            throw new ResourceConflictException("Minimum capacity cannot be greater than maximum capacity");
        }

        return campusResourceRepository.findAll().stream()
                .filter(resource -> normalizedType == null || normalizedType.equals(resource.getType()))
                .filter(resource -> normalizedStatus == null || normalizedStatus.equals(resource.getStatus()))
                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                .filter(resource -> maxCapacity == null || resource.getCapacity() <= maxCapacity)
                .filter(resource -> matchesLocation(resource, normalizedLocation))
                .filter(resource -> matchesSearch(resource, normalizedSearch))
                .sorted(Comparator
                        .comparing(CampusResource::getType, Comparator.nullsLast(String::compareTo))
                        .thenComparing(CampusResource::getName, Comparator.nullsLast(String::compareTo)))
                .map(this::toResponse)
                .toList();
    }

    public ResourceUsageAnalyticsResponse getResourceUsageAnalytics() {
        List<CampusResource> resources = campusResourceRepository.findAll();
        long activeResources = resources.stream()
                .filter(resource -> "ACTIVE".equals(resource.getStatus()))
                .count();

        if (resources.isEmpty()) {
            return new ResourceUsageAnalyticsResponse(
                    0,
                    0,
                    0,
                    List.of(),
                    List.of());
        }

        List<String> resourceIds = resources.stream()
                .map(CampusResource::getId)
                .toList();

        List<ResourceBooking> usageBookings = resourceBookingRepository.findByResourceIdIn(resourceIds).stream()
                .filter(this::isUsageBooking)
                .toList();

        Map<String, CampusResource> resourceLookup = resources.stream()
                .collect(LinkedHashMap::new, (map, entry) -> map.put(entry.getId(), entry), LinkedHashMap::putAll);

        Map<String, Long> bookingCountByResourceId = usageBookings.stream()
                .collect(LinkedHashMap::new,
                        (map, booking) -> map.merge(booking.getResourceId(), 1L, Long::sum),
                        LinkedHashMap::putAll);

        List<TopResourceUsageResponse> topResources = bookingCountByResourceId.entrySet().stream()
                .filter(entry -> resourceLookup.containsKey(entry.getKey()))
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    CampusResource resource = resourceLookup.get(entry.getKey());
                    return new TopResourceUsageResponse(
                            resource.getId(),
                            resource.getName(),
                            resource.getType(),
                            resource.getLocation(),
                            entry.getValue());
                })
                .toList();

        Map<String, Long> bookingCountByHour = usageBookings.stream()
                .filter(booking -> booking.getStartTime() != null)
                .collect(LinkedHashMap::new,
                        (map, booking) -> {
                            String hour = booking.getStartTime()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalTime()
                                    .format(HOUR_FORMATTER);
                            map.merge(hour, 1L, Long::sum);
                        },
                        LinkedHashMap::putAll);

        List<PeakBookingHourResponse> peakHours = bookingCountByHour.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                        .thenComparing(Map.Entry::getKey))
                .limit(6)
                .map(entry -> new PeakBookingHourResponse(entry.getKey(), entry.getValue()))
                .toList();

        return new ResourceUsageAnalyticsResponse(
                resources.size(),
                activeResources,
                usageBookings.size(),
                topResources,
                peakHours);
    }

    private boolean isUsageBooking(ResourceBooking booking) {
        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            return true;
        }

        String normalizedStatus = booking.getStatus().trim().toUpperCase(Locale.ROOT);
        return !EXCLUDED_BOOKING_STATUSES.contains(normalizedStatus);
    }

    private boolean matchesLocation(CampusResource resource, String normalizedLocation) {
        if (normalizedLocation == null) {
            return true;
        }

        String location = resource.getLocation();
        return location != null && location.toUpperCase(Locale.ROOT).contains(normalizedLocation);
    }

    private boolean matchesSearch(CampusResource resource, String normalizedSearch) {
        if (normalizedSearch == null) {
            return true;
        }

        String name = resource.getName() == null ? "" : resource.getName().toUpperCase(Locale.ROOT);
        String type = resource.getType() == null ? "" : resource.getType().toUpperCase(Locale.ROOT);
        String location = resource.getLocation() == null ? "" : resource.getLocation().toUpperCase(Locale.ROOT);
        String description = resource.getDescription() == null ? "" : resource.getDescription().toUpperCase(Locale.ROOT);

        return name.contains(normalizedSearch)
                || type.contains(normalizedSearch)
                || location.contains(normalizedSearch)
                || description.contains(normalizedSearch);
    }

    private CampusResource findResourceById(String id) {
        return campusResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            throw new ResourceConflictException("Resource type is required");
        }

        String normalized = type.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new ResourceConflictException("Unsupported resource type");
        }

        return normalized;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResourceConflictException("Resource status is required");
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalized)) {
            throw new ResourceConflictException("Unsupported resource status");
        }

        return normalized;
    }

    private List<AvailabilityWindow> normalizeAvailabilityWindows(List<AvailabilityWindowRequest> windows) {
        if (windows == null || windows.isEmpty()) {
            throw new ResourceConflictException("At least one availability window is required");
        }

        List<AvailabilityWindow> normalizedWindows = new ArrayList<>();

        for (AvailabilityWindowRequest window : windows) {
            if (window == null) {
                throw new ResourceConflictException("Availability window is invalid");
            }

            String normalizedDay = normalizeDay(window.dayOfWeek());
            String normalizedStartTime = normalizeTime(window.startTime(), "Start time is required");
            String normalizedEndTime = normalizeTime(window.endTime(), "End time is required");

            if (normalizedStartTime.compareTo(normalizedEndTime) >= 0) {
                throw new ResourceConflictException("Availability window start time must be before end time");
            }

            AvailabilityWindow normalizedWindow = new AvailabilityWindow();
            normalizedWindow.setDayOfWeek(normalizedDay);
            normalizedWindow.setStartTime(normalizedStartTime);
            normalizedWindow.setEndTime(normalizedEndTime);
            normalizedWindows.add(normalizedWindow);
        }

        return normalizedWindows;
    }

    private String normalizeDay(String dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek.isBlank()) {
            throw new ResourceConflictException("Availability day is required");
        }

        String normalized = dayOfWeek.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_DAYS.contains(normalized)) {
            throw new ResourceConflictException("Unsupported availability day");
        }

        return normalized;
    }

    private String normalizeTime(String time, String requiredMessage) {
        if (time == null || time.isBlank()) {
            throw new ResourceConflictException(requiredMessage);
        }

        String normalized = time.trim();
        if (!normalized.matches("^(?:[01]\\d|2[0-3]):[0-5]\\d$")) {
            throw new ResourceConflictException("Availability time must be in HH:mm format");
        }

        return normalized;
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

    private CampusResourceResponse toResponse(CampusResource resource) {
        List<AvailabilityWindowResponse> windows = resource.getAvailabilityWindows() == null
                ? List.of()
                : resource.getAvailabilityWindows().stream()
                        .map(window -> new AvailabilityWindowResponse(
                                window.getDayOfWeek(),
                                window.getStartTime(),
                                window.getEndTime()))
                        .toList();

        return new CampusResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                windows,
                resource.getStatus(),
                resource.getDescription(),
                resource.getCreatedAt(),
                resource.getUpdatedAt());
    }
}

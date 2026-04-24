package com.smartcampus.booking.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.booking.entity.ResourceBooking;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {

    List<ResourceBooking> findByResourceIdIn(List<String> resourceIds);

    List<ResourceBooking> findByBookedByUserIdOrderByCreatedAtDesc(String bookedByUserId);

    List<ResourceBooking> findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            List<String> statuses,
            Instant endTime,
            Instant startTime);

    Optional<ResourceBooking> findByIdAndCheckInToken(String id, String checkInToken);
}

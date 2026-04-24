package com.smartcampus.booking.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.booking.entity.ResourceBooking;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {

    List<ResourceBooking> findByResourceIdIn(List<String> resourceIds);
}

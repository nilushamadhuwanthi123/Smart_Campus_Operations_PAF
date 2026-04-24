package com.smartcampus.notification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.notification.entity.UserNotification;

public interface UserNotificationRepository extends MongoRepository<UserNotification, String> {

    List<UserNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<UserNotification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

    Optional<UserNotification> findByIdAndUserId(String id, String userId);
}

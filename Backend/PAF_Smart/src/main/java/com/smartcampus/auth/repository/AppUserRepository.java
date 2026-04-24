package com.smartcampus.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.UserRole;

public interface AppUserRepository extends MongoRepository<AppUser, String> {

    List<AppUser> findByRole(UserRole role);

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(UserRole role);
}

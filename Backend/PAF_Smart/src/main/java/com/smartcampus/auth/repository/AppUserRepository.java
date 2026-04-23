package com.smartcampus.auth.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.auth.entity.AppUser;

public interface AppUserRepository extends MongoRepository<AppUser, String> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}

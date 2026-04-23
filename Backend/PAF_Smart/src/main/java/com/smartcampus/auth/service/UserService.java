package com.smartcampus.auth.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.dto.UpdateProfileRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.AuthProvider;
import com.smartcampus.auth.entity.UserRole;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;

@Service
public class UserService {

    private static final String GMAIL_SUFFIX = "@gmail.com";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest request) {
        String normalizedEmail = normalizeAndValidateEmail(request.email());

        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResourceConflictException("A user with this email already exists");
        }

        Instant now = Instant.now();

        AppUser user = new AppUser();
        user.setFullName(request.fullName().trim());
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.temporaryPassword()));
        user.setRole(request.role());
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return toResponse(appUserRepository.save(user));
    }

    public List<UserResponse> listUsers() {
        return appUserRepository.findAll().stream()
                .sorted(Comparator.comparing(AppUser::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getCurrentUser(AppUserPrincipal principal) {
        return toResponse(findUserById(principal.getId()));
    }

    public UserResponse updateCurrentUser(AppUserPrincipal principal, UpdateProfileRequest request) {
        AppUser user = findUserById(principal.getId());
        user.setFullName(request.fullName().trim());
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setUpdatedAt(Instant.now());

        return toResponse(appUserRepository.save(user));
    }

    public AppUser findUserById(String id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AppUser findTechnicianById(String id) {
        AppUser user = findUserById(id);

        if (user.getRole() != UserRole.TECHNICIAN) {
            throw new ResourceConflictException("Selected user is not a technician");
        }

        return user;
    }

    public AppUser getOrCreateGoogleUser(String email, String name) {
        String normalizedEmail = normalizeAndValidateEmail(email);

        return appUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> createGoogleStudent(normalizedEmail, name));
    }

    public String normalizeAndValidateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResourceConflictException("Email is required");
        }

        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (!normalized.endsWith(GMAIL_SUFFIX)) {
            throw new ResourceConflictException("Email must end with @gmail.com");
        }

        return normalized;
    }

    private AppUser createGoogleStudent(String email, String name) {
        Instant now = Instant.now();

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setFullName(name == null || name.isBlank() ? "Campus Student" : name.trim());
        user.setPhoneNumber("0000000000");
        user.setPasswordHash(null);
        user.setRole(UserRole.STUDENT);
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return appUserRepository.save(user);
    }

    public UserResponse toResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}

package com.smartcampus.auth.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.dto.UpdateProfileRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.auth.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.listUsers();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/me")
    public UserResponse getMyProfile(@AuthenticationPrincipal AppUserPrincipal principal) {
        return userService.getCurrentUser(principal);
    }

    @PatchMapping("/me")
    public UserResponse updateMyProfile(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateCurrentUser(principal, request);
    }
}

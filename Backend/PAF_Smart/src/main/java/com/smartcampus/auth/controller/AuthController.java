package com.smartcampus.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.GoogleAuthRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.auth.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public AuthResponse loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.loginWithGoogle(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AppUserPrincipal principal) {
        return authService.getCurrentUser(principal);
    }
}

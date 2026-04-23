package com.smartcampus.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AuthLoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email is invalid")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", message = "Email must end with @gmail.com")
        String email,

        @NotBlank(message = "Password is required")
        String password) {
}

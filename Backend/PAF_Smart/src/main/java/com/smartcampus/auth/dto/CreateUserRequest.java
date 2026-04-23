package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name must not exceed 120 characters")
        String fullName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
        String phoneNumber,

        @NotBlank(message = "Email is required")
        @Email(message = "Email is invalid")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", message = "Email must end with @gmail.com")
        String email,

        @NotBlank(message = "Temporary password is required")
        @Size(min = 8, max = 100, message = "Temporary password must be 8-100 characters")
        String temporaryPassword,

        @NotNull(message = "Role is required")
        UserRole role) {
}

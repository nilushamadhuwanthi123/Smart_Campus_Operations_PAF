package com.smartcampus.auth.service;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.AuthProvider;
import com.smartcampus.auth.entity.UserRole;
import com.smartcampus.auth.repository.AppUserRepository;

@Component
public class AdminSeedService implements ApplicationRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Value("${app.auth.seed-admin.full-name:System Administrator}")
    private String adminFullName;

    @Value("${app.auth.seed-admin.phone-number:0000000000}")
    private String adminPhoneNumber;

    @Value("${app.auth.seed-admin.email:admin@gmail.com}")
    private String adminEmail;

    @Value("${app.auth.seed-admin.temporary-password:Admin@12345}")
    private String adminTemporaryPassword;

    public AdminSeedService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            UserService userService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) {
        String normalizedEmail = userService.normalizeAndValidateEmail(adminEmail);
        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return;
        }

        Instant now = Instant.now();

        AppUser seededAdmin = new AppUser();
        seededAdmin.setFullName(adminFullName.trim());
        seededAdmin.setPhoneNumber(adminPhoneNumber.trim());
        seededAdmin.setEmail(normalizedEmail);
        seededAdmin.setPasswordHash(passwordEncoder.encode(adminTemporaryPassword));
        seededAdmin.setRole(UserRole.ADMIN);
        seededAdmin.setAuthProvider(AuthProvider.LOCAL);
        seededAdmin.setCreatedAt(now);
        seededAdmin.setUpdatedAt(now);

        appUserRepository.save(seededAdmin);

        System.out.printf("Seeded default admin user: %s%n", normalizedEmail);
    }
}

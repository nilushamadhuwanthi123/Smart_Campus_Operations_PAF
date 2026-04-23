package com.smartcampus.auth.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.GoogleAuthRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.security.AppUserPrincipal;
import com.smartcampus.auth.security.JwtService;

@Service
public class AuthService {

    private static final Duration GOOGLE_TIMEOUT = Duration.ofSeconds(10);

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final HttpClient httpClient;
    private final String googleClientId;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserService userService,
            JwtService jwtService,
            @Value("${app.auth.google-client-id:}") String googleClientId) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
        this.httpClient = HttpClient.newBuilder().connectTimeout(GOOGLE_TIMEOUT).build();
    }

    public AuthResponse login(AuthLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(Locale.ROOT),
                        request.password()));

        AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
        AppUser user = userService.findUserById(principal.getId());

        return new AuthResponse(jwtService.generateToken(principal), userService.toResponse(user));
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        GoogleProfile profile = validateGoogleToken(request.idToken());

        AppUser user = userService.getOrCreateGoogleUser(profile.email(), profile.name());
        AppUserPrincipal principal = AppUserPrincipal.fromUser(user);

        return new AuthResponse(jwtService.generateToken(principal), userService.toResponse(user));
    }

    public UserResponse getCurrentUser(AppUserPrincipal principal) {
        return userService.getCurrentUser(principal);
    }

    private GoogleProfile validateGoogleToken(String idToken) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token="
                            + URLEncoder.encode(idToken, StandardCharsets.UTF_8)))
                    .timeout(GOOGLE_TIMEOUT)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new BadCredentialsException("Invalid Google token");
            }

            String payload = response.body();
            if (hasJsonField(payload, "error_description")) {
                throw new BadCredentialsException("Invalid Google token");
            }

            String email = readJsonValue(payload, "email");
            String name = readJsonValue(payload, "name");
            String aud = readJsonValue(payload, "aud");
            String emailVerified = readJsonValue(payload, "email_verified");

            if (!"true".equalsIgnoreCase(emailVerified)) {
                throw new BadCredentialsException("Google email is not verified");
            }

            if (!googleClientId.isBlank() && !googleClientId.equals(aud)) {
                throw new BadCredentialsException("Google token client mismatch");
            }

            String normalizedEmail = userService.normalizeAndValidateEmail(email);
            return new GoogleProfile(normalizedEmail, name);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BadCredentialsException("Failed to verify Google token");
        } catch (IOException ex) {
            throw new BadCredentialsException("Failed to verify Google token");
        }
    }

    private boolean hasJsonField(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(fieldName) + "\"\\s*:");
        return pattern.matcher(json).find();
    }

    private String readJsonValue(String json, String fieldName) {
        String keyPattern = "\"" + Pattern.quote(fieldName) + "\"\\s*:";

        Pattern quotedPattern = Pattern.compile(keyPattern + "\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
        Matcher quotedMatcher = quotedPattern.matcher(json);
        if (quotedMatcher.find()) {
            return unescapeJson(quotedMatcher.group(1));
        }

        Pattern rawPattern = Pattern.compile(keyPattern + "\\s*(true|false|null|-?\\d+(?:\\.\\d+)?)");
        Matcher rawMatcher = rawPattern.matcher(json);
        if (rawMatcher.find()) {
            return rawMatcher.group(1);
        }

        return "";
    }

    private String unescapeJson(String value) {
        return value
                .replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t");
    }

    private record GoogleProfile(String email, String name) {
    }
}

package com.smartcampus.auth.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.auth.jwt-secret:smart-campus-dev-secret-change-me-smart-campus-dev-secret}") String secret,
            @Value("${app.auth.jwt-expiration-seconds:43200}") long expirationSeconds) {
        this.signingKey = Keys.hmacShaKeyFor(ensureMinLength(secret.getBytes(StandardCharsets.UTF_8), 32));
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(AppUserPrincipal principal) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(expirationSeconds);

        return Jwts.builder()
                .subject(principal.getUsername())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .claims(Map.of(
                        "uid", principal.getId(),
                        "role", principal.getRole().name(),
                        "name", principal.getFullName()))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] ensureMinLength(byte[] source, int minLength) {
        if (source.length >= minLength) {
            return source;
        }

        return Arrays.copyOf(source, minLength);
    }
}

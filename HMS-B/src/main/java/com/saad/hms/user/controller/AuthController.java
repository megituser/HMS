package com.saad.hms.user.controller;

import com.saad.hms.exception.BadRequestException;
import com.saad.hms.security.JwtUtils;
import com.saad.hms.security.LoginRateLimiterService;
import com.saad.hms.security.RefreshToken;
import com.saad.hms.security.RefreshTokenService;
import com.saad.hms.user.dto.*;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Login, logout and token refresh")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtil;
    private final LoginRateLimiterService rateLimiter;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpRequest) {

        String ip = getClientIp(httpRequest);
        String username = req.getUsername() != null ? req.getUsername().trim() : "";

        log.info("Login attempt for username: {} from IP: {}", username, ip);

        if (!rateLimiter.isAllowed(ip)) {
            log.warn("Rate limit exceeded for IP: {}", ip);
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many login attempts. Please wait 1 minute.");
        }

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Login failed — username not found: {}", username);
                    return new BadRequestException("Invalid credentials");
                });

        if (user.getEnabled() != null && !user.getEnabled()) {
            log.warn("Login failed — user disabled: {}", username);
            throw new BadRequestException("User is disabled");
        }

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            log.warn("Login failed — wrong password for username: {} from IP: {}", username, ip);
            throw new BadRequestException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().getName());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        log.info("Login successful for username: {} from IP: {}", user.getUsername(), ip);

        return ResponseEntity.ok(new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getUsername(),
                user.getRole().getName()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @Valid @RequestBody RefreshTokenRequest req) {

        log.info("Token refresh requested");

        RefreshToken refreshToken = refreshTokenService.validate(req.getRefreshToken());

        User user = userRepo.findByUsername(refreshToken.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getEnabled() != null && !user.getEnabled()) {
            log.warn("Token refresh failed — user disabled: {}", refreshToken.getUsername());
            throw new BadRequestException("User is disabled");
        }

        String newAccessToken = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().getName());

        log.info("Token refreshed successfully for username: {}", user.getUsername());

        return ResponseEntity.ok(new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),
                user.getUsername(),
                user.getRole().getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Logout requested for username: {}", userDetails.getUsername());

        refreshTokenService.revokeByUsername(userDetails.getUsername());

        log.info("Logout successful for username: {}", userDetails.getUsername());

        return ResponseEntity.ok("Logged out successfully");
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
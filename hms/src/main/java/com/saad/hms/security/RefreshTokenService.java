package com.saad.hms.security;

import com.saad.hms.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    // 7 days
    private static final long REFRESH_EXPIRY_DAYS = 7;

    private final RefreshTokenRepository refreshTokenRepo;

    @Transactional
    public RefreshToken createRefreshToken(String username) {

        // delete any existing token for this user first
        refreshTokenRepo.deleteByUsername(username);

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .username(username)
                .expiryDate(LocalDateTime.now().plusDays(REFRESH_EXPIRY_DAYS))
                .revoked(false)
                .build();

        return refreshTokenRepo.save(token);
    }

    public RefreshToken validate(String token) {

        RefreshToken refreshToken = refreshTokenRepo.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new BadRequestException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepo.delete(refreshToken);
            throw new BadRequestException("Refresh token has expired. Please login again.");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeByUsername(String username) {
        refreshTokenRepo.deleteByUsername(username);
    }
}
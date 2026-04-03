package com.saad.hms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private final Key key;
    private final long expiration;

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    public JwtUtils(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expiration
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiration = expiration;
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;

        } catch (ExpiredJwtException ex) {
            log.warn("JWT expired");
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT");
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT");
        } catch (SecurityException ex) {
            log.warn("Invalid signature");
        } catch (IllegalArgumentException ex) {
            log.warn("Empty JWT");
        }

        return false;
    }

    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public String getRole(String token) {
        return (String) getClaims(token).get("role");
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
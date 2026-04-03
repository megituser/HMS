package com.saad.hms.user.controller;
import com.saad.hms.exception.BadRequestException;
import com.saad.hms.security.JwtUtils;
import com.saad.hms.user.dto.*;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @Valid @RequestBody LoginRequest req) {

        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!user.isEnabled()) {
            throw new BadRequestException("User is disabled");
        }

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().getName()
        );

        return ResponseEntity.ok(
                new JwtResponse(token, user.getUsername(), user.getRole().getName())
        );
    }
}
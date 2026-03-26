package com.saad.hms.user.controller;
import com.saad.hms.security.JwtUtils;
import com.saad.hms.user.dto.*;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtil;

    public AuthController(UserRepository userRepo,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        User user = userRepo.findByUsername(req.getUsername())
                .orElse(null);

        if (user == null)
            return ResponseEntity.status(401).body("Invalid credentials");

        if (!user.isEnabled())
            return ResponseEntity.status(403).body("User disabled");

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            return ResponseEntity.status(401).body("Invalid credentials");

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().getName()
        );

        return ResponseEntity.ok(
                new JwtResponse(token, user.getUsername(), user.getRole().getName())
        );
    }

}

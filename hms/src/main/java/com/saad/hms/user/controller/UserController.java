package com.saad.hms.user.controller;

import com.saad.hms.user.dto.CreateUserRequest;
import com.saad.hms.user.dto.UpdateUserRequest;
import com.saad.hms.user.dto.UserResponseDTO;
import com.saad.hms.user.entity.Role;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.RoleRepository;
import com.saad.hms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    // ✅ CREATE USER (ADMIN ONLY)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {

        Role role = roleRepository.findByName(req.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    // ✅ GET ALL USERS (ADMIN ONLY)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> {
                    UserResponseDTO dto = new UserResponseDTO();
                    dto.setId(u.getId());
                    dto.setUsername(u.getUsername());
                    dto.setEmail(u.getEmail());
                    dto.setRole(u.getRole().getName());
                    dto.setEnabled(u.isEnabled());
                    return dto;
                })
                .toList();
    }

    @GetMapping("/available-doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAvailableDoctorUsers() {
        return userRepository.findAvailableDoctorUsers();
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest req) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getEmail() != null)
            user.setEmail(req.getEmail());

        if (req.getRole() != null) {
            Role role = roleRepository.findByName(req.getRole())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        if (req.getEnabled() != null)
            user.setEnabled(req.getEnabled());

        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}


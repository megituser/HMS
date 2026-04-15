package com.saad.hms.user.controller;

import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.user.dto.CreateUserRequest;
import com.saad.hms.user.dto.UpdateUserRequest;
import com.saad.hms.user.dto.UserResponseDTO;
import com.saad.hms.user.entity.Role;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.RoleRepository;
import com.saad.hms.user.repository.UserRepository;
import com.saad.hms.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // ✅ CREATE USER
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createUser(
            @Valid @RequestBody CreateUserRequest req) {

        userService.createUser(req);
        return ResponseEntity.status(201).build();
    }

    // ✅ GET ALL USERS (PAGINATED)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);

        Page<UserResponseDTO> dtoPage = userPage.map(u -> {
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(u.getId());
            dto.setUsername(u.getUsername());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole().getName());
            dto.setEnabled(u.isEnabled());
            return dto;
        });

        return ResponseEntity.ok(dtoPage);
    }

    // ✅ UPDATE USER
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateUser(
            @PathVariable @Positive Long id,
            @RequestBody UpdateUserRequest req) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getEmail() != null)
            user.setEmail(req.getEmail());

        if (req.getEnabled() != null)
            user.setEnabled(req.getEnabled());

        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}

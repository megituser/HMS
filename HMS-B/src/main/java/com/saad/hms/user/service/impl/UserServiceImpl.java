package com.saad.hms.user.service.impl;

import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.user.dto.CreateUserRequest;
import com.saad.hms.user.entity.Role;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.RoleRepository;
import com.saad.hms.user.repository.UserRepository;
import com.saad.hms.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;

    @Override
    public void createUser(CreateUserRequest request) {

        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            throw new BadRequestException("Username already exists");
        }

        Role role = roleRepo.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = new User();
        user.setUsername(request.getUsername() != null ? request.getUsername().trim() : null);
        user.setPassword(encoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(role);
        user.setEnabled(true);

        userRepo.save(user);
    }
}
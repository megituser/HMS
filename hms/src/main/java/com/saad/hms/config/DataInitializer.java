package com.saad.hms.config;

import com.saad.hms.user.entity.*;
import com.saad.hms.user.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {

        createRole("ROLE_ADMIN");
        createRole("ROLE_DOCTOR");
        createRole("ROLE_RECEPTIONIST");
        createRole("ROLE_ACCOUNTANT");

        if (userRepo.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepo.findByName("ROLE_ADMIN").orElseThrow();

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setEmail("admin@example.com");
            admin.setRole(adminRole);

            userRepo.save(admin);

            System.out.println("ADMIN USER CREATED: admin / admin123");
        }
    }

    private void createRole(String name) {
        if (roleRepo.findByName(name).isEmpty()) {
            roleRepo.save(new Role(null, name));
        }
    }
}

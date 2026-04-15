package com.saad.hms.config;

import com.saad.hms.user.entity.*;
import com.saad.hms.user.repository.*;
import com.saad.hms.department.entity.Department;
import com.saad.hms.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final DepartmentRepository departmentRepo;

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) {

        createRole("ROLE_ADMIN");
        createRole("ROLE_DOCTOR");
        createRole("ROLE_RECEPTIONIST");
        createRole("ROLE_ACCOUNTANT");

        if (userRepo.findByUsername("admin").isEmpty()) {

            Role adminRole = roleRepo.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setEmail("admin@example.com");
            admin.setRole(adminRole);

            userRepo.save(admin);

            log.info("Admin user created: username=admin");
        }

        if (userRepo.findByUsername("doctor").isEmpty()) {
            Role doctorRole = roleRepo.findByName("ROLE_DOCTOR")
                    .orElseThrow(() -> new RuntimeException("Doctor role not found"));

            User doctor = new User();
            doctor.setUsername("doctor");
            doctor.setPassword(encoder.encode("doctor123"));
            doctor.setEmail("doctor@example.com");
            doctor.setRole(doctorRole);

            userRepo.save(doctor);
            log.info("Doctor user created: username=doctor");
        }

        if (departmentRepo.count() == 0) {
            Department cardiology = new Department();
            cardiology.setName("Cardiology");
            cardiology.setDescription("Heart and cardiovascular system");
            departmentRepo.save(cardiology);
            
            Department neurology = new Department();
            neurology.setName("Neurology");
            neurology.setDescription("Brain and nervous system");
            departmentRepo.save(neurology);
            
            log.info("Initialized default departments.");
        }
    }

    private void createRole(String name) {
        if (roleRepo.findByName(name).isEmpty()) {
            roleRepo.save(new Role(null, name));
            log.info("Role created: {}", name);
        }
    }
}
package com.saad.hms.user.repository;
import com.saad.hms.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE u.role.name = 'ROLE_DOCTOR'
        AND u.id NOT IN (
            SELECT d.user.id FROM Doctor d WHERE d.user IS NOT NULL
        )
    """)
    List<User> findAvailableDoctorUsers();
}


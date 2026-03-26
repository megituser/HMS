package com.saad.hms.patient.repository;

import com.saad.hms.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Find only active patients
    List<Patient> findByActiveTrue();

    // Find active patient by ID
    Optional<Patient> findByIdAndActiveTrue(Long id);

    // Search patient by name or phone (case-insensitive)
    @Query("""
        SELECT p FROM Patient p
        WHERE p.active = true
        AND (
            LOWER(p.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR p.phone LIKE CONCAT('%', :keyword, '%')
        )
    """)
    List<Patient> searchActivePatients(@Param("keyword") String keyword);

    // Check duplicate phone number (optional but professional)
    boolean existsByPhone(String phone);
}

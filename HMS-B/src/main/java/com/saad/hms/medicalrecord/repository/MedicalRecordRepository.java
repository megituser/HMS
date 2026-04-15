package com.saad.hms.medicalrecord.repository;

import com.saad.hms.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    // ✅ EXISTING (keep if needed elsewhere)
    List<MedicalRecord> findByPatientIdAndDeletedFalse(Long patientId);

    List<MedicalRecord> findByDoctorIdAndDeletedFalse(Long doctorId);

    Optional<MedicalRecord> findByIdAndDeletedFalse(Long id);

    List<MedicalRecord> findByDeletedFalse();

    // ✅ NEW (FIX LAZY ISSUE - PRODUCTION SAFE)
    @Query("""
        SELECT mr FROM MedicalRecord mr
        LEFT JOIN FETCH mr.patient
        LEFT JOIN FETCH mr.doctor
        WHERE mr.deleted = false
    """)
    List<MedicalRecord> findAllWithDetails();

    // ✅ OPTIONAL (recommended for consistency)
    @Query("""
        SELECT mr FROM MedicalRecord mr
        LEFT JOIN FETCH mr.patient
        LEFT JOIN FETCH mr.doctor
        WHERE mr.patient.id = :patientId AND mr.deleted = false
    """)
    List<MedicalRecord> findByPatientIdWithDetails(Long patientId);

    @Query("""
        SELECT mr FROM MedicalRecord mr
        LEFT JOIN FETCH mr.patient
        LEFT JOIN FETCH mr.doctor
        WHERE mr.doctor.id = :doctorId AND mr.deleted = false
    """)
    List<MedicalRecord> findByDoctorIdWithDetails(Long doctorId);
}
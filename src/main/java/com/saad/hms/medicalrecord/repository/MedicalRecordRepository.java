package com.saad.hms.medicalrecord.repository;

import com.saad.hms.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatientIdAndDeletedFalse(Long patientId);

    List<MedicalRecord> findByDoctorIdAndDeletedFalse(Long doctorId);

    Optional<MedicalRecord> findByIdAndDeletedFalse(Long id); // 🔥 add this
}
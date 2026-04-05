package com.saad.hms.room.repository;

import com.saad.hms.room.entity.Admission;
import com.saad.hms.room.entity.AdmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {

    Page<Admission> findAll(Pageable pageable);

    List<Admission> findByPatientId(Long patientId);

    List<Admission> findByDoctorId(Long doctorId);

    List<Admission> findByStatus(AdmissionStatus status);

    Optional<Admission> findByBedIdAndStatus(Long bedId, AdmissionStatus status);

    boolean existsByBedIdAndStatus(Long bedId, AdmissionStatus status);

    Optional<Admission> findByPatientIdAndStatus(Long patientId, AdmissionStatus status);
}
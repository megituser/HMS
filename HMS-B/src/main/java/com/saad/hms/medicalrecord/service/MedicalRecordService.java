package com.saad.hms.medicalrecord.service;

import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.medicalrecord.dto.*;
import com.saad.hms.medicalrecord.entity.MedicalRecord;
import com.saad.hms.medicalrecord.repository.MedicalRecordRepository;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import com.saad.hms.doctor.entity.Doctor;
import com.saad.hms.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository repository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    // 🔐 Get logged-in username
    private String getLoggedInUsername() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    // ✅ CREATE (Doctor only)
    @Transactional
    public MedicalRecordResponseDTO create(MedicalRecordRequestDTO dto) {

        if (dto.getPatientId() == null) {
            throw new BadRequestException("Patient ID is required");
        }

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findByUserUsername(getLoggedInUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        MedicalRecord record = MedicalRecord.builder()
                .diagnosis(dto.getDiagnosis())
                .notes(dto.getNotes())
                .visitDate(dto.getVisitDate())
                .patient(patient)
                .doctor(doctor)
                .deleted(false)
                .build();

        MedicalRecord saved = repository.save(record);

        return mapToDTO(saved);
    }

    // ✅ ADMIN → get ALL records (FIXED)
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> getAllRecords() {
        return repository.findAllWithDetails() // 🔥 FIXED
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ ADMIN → get records by patient
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> getByPatient(Long patientId) {

        if (patientId == null) {
            throw new BadRequestException("Patient ID is required");
        }

        return repository.findByPatientIdWithDetails(patientId) // 🔥 FIXED
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ DOCTOR → get ONLY own records
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> getMyRecords() {

        Doctor doctor = doctorRepository.findByUserUsername(getLoggedInUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return repository.findByDoctorIdWithDetails(doctor.getId()) // 🔥 FIXED
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ SOFT DELETE (Admin)
    @Transactional
    public void delete(Long id) {

        if (id == null) {
            throw new BadRequestException("Record ID is required");
        }

        MedicalRecord record = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        record.setDeleted(true);
        repository.save(record);
    }

    // 🔁 Mapper (SAFE + PRODUCTION)
    private MedicalRecordResponseDTO mapToDTO(MedicalRecord r) {
        return MedicalRecordResponseDTO.builder()
                .id(r.getId())
                .diagnosis(r.getDiagnosis())
                .notes(r.getNotes())
                .visitDate(r.getVisitDate())
                .patientName(
                        r.getPatient() != null
                                ? r.getPatient().getFirstName() + " " + r.getPatient().getLastName()
                                : "N/A"
                )
                .doctorName(
                        r.getDoctor() != null
                                ? r.getDoctor().getFirstName() + " " + r.getDoctor().getLastName()
                                : "N/A"
                )
                .build();
    }
}
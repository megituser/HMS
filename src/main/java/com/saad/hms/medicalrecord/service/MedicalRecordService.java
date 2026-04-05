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
                .build();

        MedicalRecord saved = repository.save(record);

        return mapToDTO(saved);
    }

    // ✅ ADMIN → get records by patient
    public List<MedicalRecordResponseDTO> getByPatient(Long patientId) {

        if (patientId == null) {
            throw new BadRequestException("Patient ID is required");
        }

        return repository.findByPatientIdAndDeletedFalse(patientId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ DOCTOR → get ONLY own records
    public List<MedicalRecordResponseDTO> getMyRecords() {

        Doctor doctor = doctorRepository.findByUserUsername(getLoggedInUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return repository.findByDoctorIdAndDeletedFalse(doctor.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ SOFT DELETE (Admin)
    public void delete(Long id) {

        if (id == null) {
            throw new BadRequestException("Record ID is required");
        }

        MedicalRecord record = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        record.setDeleted(true);
        repository.save(record);
    }

    // 🔁 Mapper
    private MedicalRecordResponseDTO mapToDTO(MedicalRecord r) {
        return MedicalRecordResponseDTO.builder()
                .id(r.getId())
                .diagnosis(r.getDiagnosis())
                .notes(r.getNotes())
                .visitDate(r.getVisitDate())
                .build();
    }
}
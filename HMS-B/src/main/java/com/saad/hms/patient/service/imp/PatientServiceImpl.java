package com.saad.hms.patient.service.imp;

import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.patient.dto.*;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import com.saad.hms.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    @Override
    public PatientResponseDTO createPatient(PatientRequestDTO request) {

        if (request.getPhone() == null) {
            throw new BadRequestException("Phone number is required");
        }

        if (patientRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Patient with this phone already exists");
        }

        log.info("Creating patient with phone: {}", request.getPhone());

        Patient patient = modelMapper.map(request, Patient.class);
        Patient saved = patientRepository.save(patient);

        log.info("Patient created successfully with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    public Page<PatientResponseDTO> getAllActivePatients(Pageable pageable) {
        log.debug("Fetching active patients - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return patientRepository.findByActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public PatientResponseDTO getPatientById(Long id) {

        if (id == null) {
            throw new BadRequestException("Patient ID is required");
        }

        log.debug("Fetching patient with id: {}", id);

        Patient patient = patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        return mapToResponse(patient);
    }

    @Override
    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO request) {

        if (id == null) {
            throw new BadRequestException("Patient ID is required");
        }

        Patient patient = patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (request.getPhone() != null &&
                !request.getPhone().equals(patient.getPhone()) &&
                patientRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already in use");
        }

        log.info("Updating patient with id: {}", id);

        modelMapper.map(request, patient);
        Patient updated = patientRepository.save(patient);

        log.info("Patient updated successfully with id: {}", updated.getId());

        return mapToResponse(updated);
    }

    @Override
    public void deactivatePatient(Long id) {

        if (id == null) {
            throw new BadRequestException("Patient ID is required");
        }

        Patient patient = patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        log.info("Deactivating patient with id: {}", id);

        patient.setActive(false);
        patientRepository.save(patient);

        log.info("Patient deactivated successfully with id: {}", id);
    }

    @Override
    public List<PatientResponseDTO> searchPatients(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            throw new BadRequestException("Search keyword is required");
        }

        log.debug("Searching patients with keyword: {}", keyword);

        return patientRepository.searchActivePatients(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PatientResponseDTO mapToResponse(Patient patient) {
        return PatientResponseDTO.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .gender(patient.getGender())
                .dateOfBirth(patient.getDateOfBirth())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .bloodGroup(patient.getBloodGroup())
                .emergencyContact(patient.getEmergencyContact())
                .active(patient.isActive())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
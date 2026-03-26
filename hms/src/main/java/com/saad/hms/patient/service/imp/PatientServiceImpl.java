package com.saad.hms.patient.service.imp;

import com.saad.hms.patient.dto.*;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import com.saad.hms.patient.service.PatientService;
import com.saad.hms.config.AppConfig;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    @Override
    public PatientResponseDTO createPatient(PatientRequestDTO request) {

        if (patientRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Patient with this phone already exists");
        }

        Patient patient = modelMapper.map(request, Patient.class);
        Patient saved = patientRepository.save(patient);

        return mapToResponse(saved);
    }

    @Override
    public List<PatientResponseDTO> getAllActivePatients() {
        return patientRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PatientResponseDTO getPatientById(Long id) {
        Patient patient = patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return mapToResponse(patient);
    }

    @Override
    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO request) {

        Patient patient = patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        modelMapper.map(request, patient);
        Patient updated = patientRepository.save(patient);

        return mapToResponse(updated);
    }

    @Override
    public void deactivatePatient(Long id) {
        Patient patient = patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setActive(false);
        patientRepository.save(patient);
    }

    @Override
    public List<PatientResponseDTO> searchPatients(String keyword) {
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

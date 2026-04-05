package com.saad.hms.patient.service;

import com.saad.hms.patient.dto.PatientRequestDTO;
import com.saad.hms.patient.dto.PatientResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PatientService {

    PatientResponseDTO createPatient(PatientRequestDTO request);

    Page<PatientResponseDTO> getAllActivePatients(Pageable pageable);

    PatientResponseDTO getPatientById(Long id);

    PatientResponseDTO updatePatient(Long id, PatientRequestDTO request);

    void deactivatePatient(Long id);

    List<PatientResponseDTO> searchPatients(String keyword);
}

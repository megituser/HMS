package com.saad.hms.doctor.service;

import com.saad.hms.doctor.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorService {

    DoctorResponseDTO createDoctor(DoctorRequestDTO request);

    Page<DoctorResponseDTO> getAllDoctors(Pageable pageable);

    List<DoctorResponseDTO> getDoctorsByDepartment(Long departmentId);

    DoctorResponseDTO getDoctorById(Long id);

    DoctorResponseDTO updateDoctor(Long id, UpdateDTO request);

    void deactivateDoctor(Long id);

    DoctorResponseDTO getMyProfile();

}

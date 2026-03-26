package com.saad.hms.doctor.service;

import com.saad.hms.doctor.dto.*;

import java.util.List;

public interface DoctorService {

    DoctorResponseDTO createDoctor(DoctorRequestDTO request);

    List<DoctorResponseDTO> getAllDoctors();

    List<DoctorResponseDTO> getDoctorsByDepartment(Long departmentId);

    DoctorResponseDTO getDoctorById(Long id);

    DoctorResponseDTO updateDoctor(Long id, UpdateDTO request);

    void deactivateDoctor(Long id);

    DoctorResponseDTO getMyProfile();

}

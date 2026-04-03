package com.saad.hms.doctor.service.impl;

import com.saad.hms.department.entity.Department;
import com.saad.hms.department.repository.DepartmentRepository;
import com.saad.hms.doctor.dto.*;
import com.saad.hms.doctor.entity.Doctor;
import com.saad.hms.doctor.repository.DoctorRepository;
import com.saad.hms.doctor.service.DoctorService;
import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    public DoctorResponseDTO createDoctor(DoctorRequestDTO request) {

        if (request.getUserId() == null) {
            throw new BadRequestException("User ID is required");
        }

        if (request.getDepartmentId() == null) {
            throw new BadRequestException("Department ID is required");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().getName().equals("ROLE_DOCTOR")) {
            throw new BadRequestException("Selected user is not a doctor");
        }

        if (doctorRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Doctor already exists for this user");
        }

        Department department = departmentRepository
                .findByIdAndActiveTrue(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Doctor doctor = Doctor.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .specialization(request.getSpecialization())
                .experienceYears(request.getExperienceYears())
                .department(department)
                .user(user)
                .build();

        doctorRepository.save(doctor);

        return mapToResponse(doctor);
    }

    @Override
    public List<DoctorResponseDTO> getAllDoctors() {
        return doctorRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<DoctorResponseDTO> getDoctorsByDepartment(Long departmentId) {

        if (departmentId == null) {
            throw new BadRequestException("Department ID is required");
        }

        return doctorRepository.findByDepartmentIdAndActiveTrue(departmentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DoctorResponseDTO getDoctorById(Long id) {

        if (id == null) {
            throw new BadRequestException("Doctor ID is required");
        }

        Doctor doctor = doctorRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return mapToResponse(doctor);
    }

    @Override
    public DoctorResponseDTO updateDoctor(Long id, UpdateDTO request) {

        if (id == null) {
            throw new BadRequestException("Doctor ID is required");
        }

        Doctor doctor = doctorRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Department department = departmentRepository.findByIdAndActiveTrue(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setPhone(request.getPhone());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setDepartment(department);

        return mapToResponse(doctor);
    }

    @Override
    public void deactivateDoctor(Long id) {

        if (id == null) {
            throw new BadRequestException("Doctor ID is required");
        }

        Doctor doctor = doctorRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        doctor.setActive(false);
        doctorRepository.save(doctor);
    }

    @Override
    public DoctorResponseDTO getMyProfile() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return mapToResponse(doctor);
    }

    private DoctorResponseDTO mapToResponse(Doctor doctor) {

        return DoctorResponseDTO.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .specialization(doctor.getSpecialization())
                .experienceYears(doctor.getExperienceYears())
                .active(doctor.isActive())
                .departmentId(
                        doctor.getDepartment() != null ? doctor.getDepartment().getId() : null
                )
                .departmentName(
                        doctor.getDepartment() != null ? doctor.getDepartment().getName() : "-"
                )
                .build();
    }
}
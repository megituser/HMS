package com.saad.hms.doctor.service.impl;

import com.saad.hms.department.entity.Department;
import com.saad.hms.department.repository.DepartmentRepository;
import com.saad.hms.doctor.dto.*;
import com.saad.hms.doctor.entity.Doctor;
import com.saad.hms.doctor.repository.DoctorRepository;
import com.saad.hms.doctor.service.DoctorService;
import com.saad.hms.user.entity.Role;
import com.saad.hms.user.repository.RoleRepository;
import com.saad.hms.user.entity.User;

import com.saad.hms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public DoctorResponseDTO createDoctor(DoctorRequestDTO request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().getName().equals("ROLE_DOCTOR")) {
            throw new RuntimeException("Selected user is not a doctor");
        }

        if (doctorRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("Doctor already exists for this user");
        }

        Department department = departmentRepository
                .findByIdAndActiveTrue(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

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
        return doctorRepository.findByDepartmentIdAndActiveTrue(departmentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DoctorResponseDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return mapToResponse(doctor);
    }

    @Override
    public DoctorResponseDTO updateDoctor(Long id, UpdateDTO request) {

        Doctor doctor = doctorRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Department department = departmentRepository.findByIdAndActiveTrue(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

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
        Doctor doctor = doctorRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setActive(false);
        doctorRepository.save(doctor);
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

                // ✅ SAFE DEPARTMENT MAPPING
                .departmentId(
                        doctor.getDepartment() != null
                                ? doctor.getDepartment().getId()
                                : null
                )
                .departmentName(
                        doctor.getDepartment() != null
                                ? doctor.getDepartment().getName()
                                : "-"
                )
                .build();
    }


    @Override
    public DoctorResponseDTO getMyProfile() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return mapToResponse(doctor);
    }


}

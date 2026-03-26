package com.saad.hms.department.service.impl;

import com.saad.hms.department.dto.*;
import com.saad.hms.department.entity.Department;
import com.saad.hms.department.repository.DepartmentRepository;
import com.saad.hms.department.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;

    @Override
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO request) {

        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Department already exists");
        }

        Department department = modelMapper.map(request, Department.class);
        Department saved = departmentRepository.save(department);

        return mapToResponse(saved);
    }

    @Override
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DepartmentResponseDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        return mapToResponse(department);
    }

    @Override
    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO request) {

        Department department = departmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        return mapToResponse(department);
    }

    @Override
    public void deactivateDepartment(Long id) {

        Department department = departmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        department.setActive(false);
        departmentRepository.save(department);
    }

    private DepartmentResponseDTO mapToResponse(Department department) {
        return DepartmentResponseDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .active(department.isActive())
                .createdAt(department.getCreatedAt())
                .build();
    }
}

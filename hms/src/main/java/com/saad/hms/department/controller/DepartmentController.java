package com.saad.hms.department.controller;

import com.saad.hms.department.dto.*;
import com.saad.hms.department.service.DepartmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<DepartmentResponseDTO> createDepartment(
            @Valid @RequestBody DepartmentRequestDTO request) {

        return ResponseEntity
                .status(201)
                .body(departmentService.createDepartment(request));
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> getDepartment(
            @PathVariable @Positive(message = "ID must be positive") Long id) {

        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> updateDepartment(
            @PathVariable @Positive(message = "ID must be positive") Long id,
            @Valid @RequestBody DepartmentRequestDTO request) {

        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    // ✅ DELETE (SOFT DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateDepartment(
            @PathVariable @Positive(message = "ID must be positive") Long id) {

        departmentService.deactivateDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
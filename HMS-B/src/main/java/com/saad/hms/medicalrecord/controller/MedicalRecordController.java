package com.saad.hms.medicalrecord.controller;

import com.saad.hms.medicalrecord.dto.*;
import com.saad.hms.medicalrecord.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Tag(name = "Medical Records", description = "Patient medical records")
public class MedicalRecordController {

    private final MedicalRecordService service;

    // ✅ CREATE (Doctor)
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public MedicalRecordResponseDTO create(@Valid @RequestBody MedicalRecordRequestDTO dto) {
        return service.create(dto);
    }

    // ✅ ADMIN → Get ALL records
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<MedicalRecordResponseDTO> getAll() {
        return service.getAllRecords();
    }

    // ✅ ADMIN → Get records by patient
    @GetMapping("/patient/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MedicalRecordResponseDTO> getByPatient(@PathVariable Long id) {
        return service.getByPatient(id);
    }

    // ✅ DOCTOR → Get only own records
    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<MedicalRecordResponseDTO> getMyRecords() {
        return service.getMyRecords();
    }

    // ✅ ADMIN → Soft delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Medical record deleted (soft delete)";
    }
}
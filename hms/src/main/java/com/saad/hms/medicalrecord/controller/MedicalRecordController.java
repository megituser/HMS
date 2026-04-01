package com.saad.hms.medicalrecord.controller;

import com.saad.hms.medicalrecord.dto.*;
import com.saad.hms.medicalrecord.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService service;

    // ✅ CREATE (Doctor)
    @PostMapping
    public MedicalRecordResponseDTO create(@Valid  @RequestBody MedicalRecordRequestDTO dto) {
        return service.create(dto);
    }

    // ✅ ADMIN → Get records by patient
    @GetMapping("/patient/{id}")
    public List<MedicalRecordResponseDTO> getByPatient(@PathVariable Long id) {
        return service.getByPatient(id);
    }

    // ✅ DOCTOR → Get only own records
    @GetMapping("/my")
    public List<MedicalRecordResponseDTO> getMyRecords() {
        return service.getMyRecords();
    }

    // ✅ ADMIN → Soft delete
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Medical record deleted (soft delete)";
    }
}
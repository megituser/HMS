package com.saad.hms.room.controller;

import com.saad.hms.room.dto.*;
import com.saad.hms.room.service.RoomBedService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Room & Bed Management", description = "Rooms, beds and patient admissions")
public class RoomBedController {

    private final RoomBedService service;

    // ─── ROOMS ───────────────────────────────────────────

    @PostMapping("/rooms")
    public ResponseEntity<RoomResponseDTO> createRoom(
            @Valid @RequestBody RoomRequestDTO request) {
        return ResponseEntity.status(201).body(service.createRoom(request));
    }

    @GetMapping("/rooms")
    public ResponseEntity<Page<RoomResponseDTO>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(service.getAllRooms(pageable));
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<RoomResponseDTO> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRoomById(id));
    }

    @GetMapping("/rooms/department/{departmentId}")
    public ResponseEntity<List<RoomResponseDTO>> getRoomsByDepartment(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(service.getRoomsByDepartment(departmentId));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deactivateRoom(@PathVariable Long id) {
        service.deactivateRoom(id);
        return ResponseEntity.noContent().build();
    }

    // ─── BEDS ────────────────────────────────────────────

    @PostMapping("/beds")
    public ResponseEntity<BedResponseDTO> createBed(
            @Valid @RequestBody BedRequestDTO request) {
        return ResponseEntity.status(201).body(service.createBed(request));
    }

    @GetMapping("/beds")
    public ResponseEntity<Page<BedResponseDTO>> getAllBeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(service.getAllBeds(pageable));
    }

    @GetMapping("/beds/room/{roomId}")
    public ResponseEntity<List<BedResponseDTO>> getBedsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(service.getBedsByRoom(roomId));
    }

    @GetMapping("/beds/available")
    public ResponseEntity<List<BedResponseDTO>> getAvailableBeds() {
        return ResponseEntity.ok(service.getAvailableBeds());
    }

    @GetMapping("/beds/available/department/{departmentId}")
    public ResponseEntity<List<BedResponseDTO>> getAvailableBedsByDepartment(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(service.getAvailableBedsByDepartment(departmentId));
    }

    @PatchMapping("/beds/{id}/status")
    public ResponseEntity<BedResponseDTO> updateBedStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.updateBedStatus(id, status));
    }

    @DeleteMapping("/beds/{id}")
    public ResponseEntity<Void> deactivateBed(@PathVariable Long id) {
        service.deactivateBed(id);
        return ResponseEntity.noContent().build();
    }

    // ─── ADMISSIONS ──────────────────────────────────────

    @PostMapping("/admissions")
    public ResponseEntity<AdmissionResponseDTO> admitPatient(
            @Valid @RequestBody AdmissionRequestDTO request) {
        return ResponseEntity.status(201).body(service.admitPatient(request));
    }

    @PatchMapping("/admissions/{id}/discharge")
    public ResponseEntity<AdmissionResponseDTO> dischargePatient(
            @PathVariable Long id,
            @Valid @RequestBody DischargeRequestDTO request) {
        return ResponseEntity.ok(service.dischargePatient(id, request));
    }

    @GetMapping("/admissions")
    public ResponseEntity<Page<AdmissionResponseDTO>> getAllAdmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(service.getAllAdmissions(pageable));
    }

    @GetMapping("/admissions/current")
    public ResponseEntity<List<AdmissionResponseDTO>> getCurrentlyAdmitted() {
        return ResponseEntity.ok(service.getCurrentlyAdmitted());
    }

    @GetMapping("/admissions/{id}")
    public ResponseEntity<AdmissionResponseDTO> getAdmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getAdmissionById(id));
    }

    @GetMapping("/admissions/patient/{patientId}")
    public ResponseEntity<List<AdmissionResponseDTO>> getAdmissionsByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(service.getAdmissionsByPatient(patientId));
    }
}
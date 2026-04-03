package com.saad.hms.appointment.controller;

import com.saad.hms.appointment.dto.*;
import com.saad.hms.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> createAppointment(
            @Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity
                .status(201)
                .body(appointmentService.createAppointment(request));
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // ✅ DOCTOR → MY APPOINTMENTS
    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getMyAppointments());
    }

    // ✅ COMPLETE
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> complete(
            @PathVariable @Positive(message = "ID must be positive") Long id) {

        appointmentService.completeAppointment(id);
        return ResponseEntity.ok().build();
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getAppointment(
            @PathVariable @Positive(message = "ID must be positive") Long id) {

        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // ✅ GET BY PATIENT
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPatient(
            @PathVariable @Positive(message = "Patient ID must be positive") Long patientId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByPatient(patientId));
    }

    // ✅ GET BY DOCTOR
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDoctor(
            @PathVariable @Positive(message = "Doctor ID must be positive") Long doctorId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByDoctor(doctorId));
    }

    // ✅ ADMIN ONLY
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointmentsAdmin() {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsForAdmin());
    }

    // ✅ CANCEL
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(
            @PathVariable @Positive(message = "ID must be positive") Long id) {

        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }
}

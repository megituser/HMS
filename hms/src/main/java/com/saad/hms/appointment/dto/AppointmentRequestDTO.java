package com.saad.hms.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be today or future")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    private String notes;
}
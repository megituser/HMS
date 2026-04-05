package com.saad.hms.room.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdmissionRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    @NotNull(message = "Admission date is required")
    private LocalDateTime admissionDate;

    private String reason;
    private String notes;
}
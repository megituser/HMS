package com.saad.hms.medicalrecord.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String notes;

    @NotNull(message = "Visit date is required")
    private LocalDateTime visitDate;
}
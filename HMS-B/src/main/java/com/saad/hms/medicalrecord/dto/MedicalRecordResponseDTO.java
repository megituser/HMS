package com.saad.hms.medicalrecord.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordResponseDTO {

    private Long id;
    private String diagnosis;
    private String notes;
    private LocalDateTime visitDate;

    // ✅ Added for frontend
    private String patientName;
    private String doctorName;
}
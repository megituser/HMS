package com.saad.hms.room.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdmissionResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long bedId;
    private String bedNumber;
    private String roomNumber;
    private String floor;
    private String departmentName;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private String status;
    private String reason;
    private String notes;
    private String dischargeSummary;
    private LocalDateTime createdAt;
}
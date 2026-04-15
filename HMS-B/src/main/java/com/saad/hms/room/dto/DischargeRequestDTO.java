package com.saad.hms.room.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DischargeRequestDTO {

    @NotBlank(message = "Discharge summary is required")
    private String dischargeSummary;

    private String notes;
}
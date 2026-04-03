package com.saad.hms.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateInvoiceRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;
}
package com.saad.hms.billing.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class InvoiceResponseDTO {
    private Long id;
    private Double totalAmount;
    private Double paidAmount;
    private String status;
}

package com.saad.hms.billing.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class InvoiceResponseDTO {
    private Long id;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String status;
}

package com.saad.hms.billing.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class InvoiceResponseDTO {
    private Long id;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String status;
    private String patientName;
    private Long patientId;
    private LocalDateTime createdAt;
    private List<BillingItemResponseDTO> items;
}

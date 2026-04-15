package com.saad.hms.billing.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BillingItemResponseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
}

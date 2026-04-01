package com.saad.hms.billing.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequestDTO {
    private Double amount;
    private String method;
}
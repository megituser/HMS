package com.saad.hms.billing.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddItemRequestDTO {
    private String description;
    private Double amount;
}

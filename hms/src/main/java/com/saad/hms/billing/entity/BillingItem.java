package com.saad.hms.billing.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "billing_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BillingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Double amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;
}
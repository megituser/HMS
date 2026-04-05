package com.saad.hms.billing.controller;

import com.saad.hms.billing.dto.*;
import com.saad.hms.billing.service.BillingService;
import com.saad.hms.billing.service.InvoicePdfService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Invoices and payments")
public class BillingController {

    private final BillingService service;

    // ✅ CREATE INVOICE
    @PostMapping
    public ResponseEntity<InvoiceResponseDTO> create(
            @Valid @RequestBody CreateInvoiceRequestDTO dto) {

        return ResponseEntity
                .status(201)
                .body(service.createInvoice(dto.getPatientId()));
    }

    // ✅ ADD ITEM
    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceResponseDTO> addItem(
            @PathVariable @Positive(message = "ID must be positive") Long id,
            @Valid @RequestBody AddItemRequestDTO dto) {

        return ResponseEntity.ok(
                service.addItem(id, dto.getDescription(), dto.getAmount()));
    }

    // ✅ PAY
    @PostMapping("/{id}/payments")
    public ResponseEntity<InvoiceResponseDTO> pay(
            @PathVariable @Positive(message = "ID must be positive") Long id,
            @Valid @RequestBody PaymentRequestDTO dto) {

        return ResponseEntity.ok(
                service.pay(id, dto.getAmount(), dto.getMethod()));
    }

    // ✅ GET INVOICE
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> get(
            @PathVariable @Positive(message = "ID must be positive") Long id) {

        return ResponseEntity.ok(service.get(id));
    }

    // ✅ GENERATE PDF
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generatePdf(
            @PathVariable @Positive(message = "ID must be positive") Long id,
            InvoicePdfService pdfService) {

        byte[] pdf = pdfService.generatePdf(id);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice.pdf")
                .body(pdf);
    }
}
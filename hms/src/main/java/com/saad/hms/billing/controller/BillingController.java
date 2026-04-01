package com.saad.hms.billing.controller;

import com.saad.hms.billing.dto.*;
import com.saad.hms.billing.service.BillingService;
import com.saad.hms.billing.service.InvoicePdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService service;
    private final InvoicePdfService pdfService;

    // ✅ CREATE INVOICE
    @PostMapping
    public ResponseEntity<InvoiceResponseDTO> create(
            @Valid @RequestBody CreateInvoiceRequestDTO dto) {

        return ResponseEntity.ok(
                service.createInvoice(dto.getPatientId())
        );
    }

    // ✅ ADD ITEM
    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceResponseDTO> addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddItemRequestDTO dto) {

        return ResponseEntity.ok(
                service.addItem(id, dto.getDescription(), dto.getAmount())
        );
    }

    // ✅ MAKE PAYMENT
    @PostMapping("/{id}/payments")
    public ResponseEntity<InvoiceResponseDTO> pay(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequestDTO dto) {

        return ResponseEntity.ok(
                service.pay(id, dto.getAmount(), dto.getMethod())
        );
    }

    // ✅ GET INVOICE
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    // ✅ DOWNLOAD PDF
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {

        byte[] pdf = pdfService.generatePdf(id);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice-" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }
}
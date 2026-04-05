package com.saad.hms.billing.controller;

import com.saad.hms.billing.dto.*;
import com.saad.hms.billing.service.BillingService;
import com.saad.hms.billing.service.InvoicePdfService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Invoices and payments")
public class BillingController {

    private final BillingService service;
    private final InvoicePdfService pdfService;

    @PostMapping
    public ResponseEntity<InvoiceResponseDTO> create(
            @Valid @RequestBody CreateInvoiceRequestDTO dto) {
        return ResponseEntity.status(201)
                .body(service.createInvoice(dto.getPatientId()));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceResponseDTO> addItem(
            @PathVariable @Positive Long id,
            @Valid @RequestBody AddItemRequestDTO dto) {
        return ResponseEntity.ok(
                service.addItem(id, dto.getDescription(), dto.getAmount()));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<InvoiceResponseDTO> pay(
            @PathVariable @Positive Long id,
            @Valid @RequestBody PaymentRequestDTO dto) {
        return ResponseEntity.ok(
                service.pay(id, dto.getAmount(), dto.getMethod()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> get(
            @PathVariable @Positive Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    // ✅ produces = APPLICATION_PDF_VALUE added
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generatePdf(
            @PathVariable @Positive Long id) {

        byte[] pdf = pdfService.generatePdf(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
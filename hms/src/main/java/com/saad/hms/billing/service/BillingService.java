package com.saad.hms.billing.service;

import com.saad.hms.billing.dto.InvoiceResponseDTO;
import com.saad.hms.billing.entity.*;
import com.saad.hms.billing.repository.*;
import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final BillingItemRepository itemRepo;
    private final PaymentRepository paymentRepo;
    private final PatientRepository patientRepo;

    public InvoiceResponseDTO createInvoice(Long patientId) {

        if (patientId == null) {
            throw new BadRequestException("Patient ID is required");
        }

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        log.info("Creating invoice for patientId: {}", patientId);

        Invoice invoice = Invoice.builder()
                .patient(patient)
                .totalAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status("PENDING")
                .build();

        Invoice saved = invoiceRepo.save(invoice);

        log.info("Invoice created successfully with id: {}", saved.getId());

        return map(saved);
    }

    public InvoiceResponseDTO addItem(Long id, String desc, BigDecimal amount) {

        if (id == null) {
            throw new BadRequestException("Invoice ID is required");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }

        if (desc == null || desc.isBlank()) {
            throw new BadRequestException("Description is required");
        }

        Invoice invoice = invoiceRepo.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        log.info("Adding item '{}' with amount: {} to invoiceId: {}", desc, amount, id);

        BillingItem item = BillingItem.builder()
                .description(desc)
                .amount(amount)
                .invoice(invoice)
                .build();

        itemRepo.save(item);

        invoice.setTotalAmount(invoice.getTotalAmount().add(amount));
        Invoice updated = invoiceRepo.save(invoice);

        log.info("Item added. Invoice {} new total: {}", id, updated.getTotalAmount());

        return map(updated);
    }

    public InvoiceResponseDTO pay(Long id, BigDecimal amount, String method) {

        if (id == null) {
            throw new BadRequestException("Invoice ID is required");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }

        if (method == null || method.isBlank()) {
            throw new BadRequestException("Payment method is required");
        }

        Invoice invoice = invoiceRepo.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        BigDecimal remaining = invoice.getTotalAmount().subtract(invoice.getPaidAmount());

        if (amount.compareTo(remaining) > 0) {
            throw new BadRequestException("Payment exceeds remaining amount");
        }

        log.info("Processing payment of {} via {} for invoiceId: {}", amount, method, id);

        Payment payment = Payment.builder()
                .amountPaid(amount)
                .paymentMethod(method)
                .invoice(invoice)
                .build();

        paymentRepo.save(payment);

        BigDecimal paid = invoice.getPaidAmount().add(amount);
        invoice.setPaidAmount(paid);
        invoice.setStatus(
                paid.compareTo(invoice.getTotalAmount()) == 0 ? "PAID" : "PARTIAL"
        );

        Invoice updated = invoiceRepo.save(invoice);

        log.info("Payment processed. Invoice {} status: {}, paidAmount: {}",
                id, updated.getStatus(), updated.getPaidAmount());

        return map(updated);
    }

    public InvoiceResponseDTO get(Long id) {

        if (id == null) {
            throw new BadRequestException("Invoice ID is required");
        }

        log.debug("Fetching invoice with id: {}", id);

        return map(invoiceRepo.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found")));
    }

    private InvoiceResponseDTO map(Invoice i) {
        return InvoiceResponseDTO.builder()
                .id(i.getId())
                .totalAmount(i.getTotalAmount())
                .paidAmount(i.getPaidAmount())
                .status(i.getStatus())
                .build();
    }
}
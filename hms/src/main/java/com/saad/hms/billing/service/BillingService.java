package com.saad.hms.billing.service;

import com.saad.hms.billing.dto.InvoiceResponseDTO;
import com.saad.hms.billing.entity.*;
import com.saad.hms.billing.repository.*;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final BillingItemRepository itemRepo;
    private final PaymentRepository paymentRepo;
    private final PatientRepository patientRepo;

    public InvoiceResponseDTO createInvoice(Long patientId) {

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Invoice invoice = Invoice.builder()
                .patient(patient)
                .totalAmount(0.0)
                .paidAmount(0.0)
                .status("PENDING")
                .build();

        return map(invoiceRepo.save(invoice));
    }

    public InvoiceResponseDTO addItem(Long id, String desc, Double amount) {

        if (amount == null || amount <= 0)
            throw new RuntimeException("Invalid amount");

        Invoice invoice = invoiceRepo.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        BillingItem item = BillingItem.builder()
                .description(desc)
                .amount(amount)
                .invoice(invoice)
                .build();

        itemRepo.save(item);

        invoice.setTotalAmount(invoice.getTotalAmount() + amount);

        return map(invoiceRepo.save(invoice));
    }

    public InvoiceResponseDTO pay(Long id, Double amount, String method) {

        Invoice invoice = invoiceRepo.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        double remaining = invoice.getTotalAmount() - invoice.getPaidAmount();

        if (amount <= 0 || amount > remaining)
            throw new RuntimeException("Invalid payment");

        Payment payment = Payment.builder()
                .amountPaid(amount)
                .paymentMethod(method)
                .invoice(invoice)
                .build();

        paymentRepo.save(payment);

        double paid = invoice.getPaidAmount() + amount;
        invoice.setPaidAmount(paid);

        invoice.setStatus(paid == invoice.getTotalAmount() ? "PAID" : "PARTIAL");

        return map(invoiceRepo.save(invoice));
    }

    public InvoiceResponseDTO get(Long id) {
        return map(invoiceRepo.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found")));
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
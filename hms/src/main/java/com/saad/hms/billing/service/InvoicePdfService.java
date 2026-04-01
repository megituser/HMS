package com.saad.hms.billing.service;

import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.*;
import com.itextpdf.layout.element.*;
import com.saad.hms.billing.entity.Invoice;
import com.saad.hms.billing.repository.InvoiceRepository;
import com.saad.hms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

import static java.lang.System.out;

@Service
@RequiredArgsConstructor
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepo;

    public byte[] generatePdf(Long invoiceId) {

        Invoice invoice = invoiceRepo.findByIdAndDeletedFalse(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Hospital Invoice")
                    .setBold()
                    .setFontSize(18));

            // Patient Info
            document.add(new Paragraph("Patient ID: " + invoice.getPatient().getId()));

            document.add(new Paragraph("Status: " + invoice.getStatus()));

            document.add(new Paragraph("\n"));

            // Table
            Table table = new Table(2);
            table.addCell("Description");
            table.addCell("Amount");

            if (invoice.getItems() != null) {
                invoice.getItems().forEach(item -> {
                    table.addCell(item.getDescription());
                    table.addCell(String.valueOf(item.getAmount()));
                });
            }

            document.add(table);

            document.add(new Paragraph("\nTotal: " + invoice.getTotalAmount()));
            document.add(new Paragraph("Paid: " + invoice.getPaidAmount()));

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF");
        }

        return out.toByteArray();
    }
}
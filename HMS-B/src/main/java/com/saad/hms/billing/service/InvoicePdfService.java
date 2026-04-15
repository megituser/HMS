package com.saad.hms.billing.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.saad.hms.billing.entity.Invoice;
import com.saad.hms.billing.repository.InvoiceRepository;
import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepo;

    public byte[] generatePdf(Long invoiceId) {

        if (invoiceId == null) {
            throw new BadRequestException("Invoice ID is required");
        }

        Invoice invoice = invoiceRepo.findByIdAndDeletedFalse(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        log.info("Generating PDF for invoiceId: {}", invoiceId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // ── Header ──────────────────────────────────────
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Hospital Management System", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.GRAY);
            Paragraph subtitle = new Paragraph("Invoice", subFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // ── Invoice Info ─────────────────────────────────
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);

            document.add(new Paragraph("Invoice ID: " + invoice.getId(), labelFont));
            document.add(new Paragraph("Patient: " +
                    invoice.getPatient().getFirstName() + " " +
                    invoice.getPatient().getLastName(), valueFont));
            document.add(new Paragraph("Status: " + invoice.getStatus(), valueFont));
            document.add(new Paragraph(" "));

            // ── Items Table ──────────────────────────────────
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(10);
            table.setWidths(new float[]{3f, 1.5f});

            // table header
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);

            PdfPCell descHeader = new PdfPCell(new Phrase("Description", headerFont));
            descHeader.setBackgroundColor(new Color(63, 81, 181));
            descHeader.setPadding(8);
            table.addCell(descHeader);

            PdfPCell amountHeader = new PdfPCell(new Phrase("Amount (Rs.)", headerFont));
            amountHeader.setBackgroundColor(new Color(63, 81, 181));
            amountHeader.setPadding(8);
            amountHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(amountHeader);

            // table rows
            if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
                boolean alternate = false;
                for (var item : invoice.getItems()) {
                    Color rowColor = alternate ? new Color(240, 240, 240) : Color.WHITE;

                    PdfPCell descCell = new PdfPCell(new Phrase(item.getDescription(), valueFont));
                    descCell.setBackgroundColor(rowColor);
                    descCell.setPadding(7);
                    table.addCell(descCell);

                    PdfPCell amtCell = new PdfPCell(new Phrase(
                            item.getAmount().toPlainString(), valueFont));
                    amtCell.setBackgroundColor(rowColor);
                    amtCell.setPadding(7);
                    amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    table.addCell(amtCell);

                    alternate = !alternate;
                }
            } else {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No items added", valueFont));
                emptyCell.setColspan(2);
                emptyCell.setPadding(7);
                table.addCell(emptyCell);
            }

            document.add(table);

            // ── Totals ───────────────────────────────────────
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);

            Paragraph total = new Paragraph("Total Amount:  Rs. " +
                    invoice.getTotalAmount().toPlainString(), totalFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            Paragraph paid = new Paragraph("Paid Amount:   Rs. " +
                    invoice.getPaidAmount().toPlainString(), valueFont);
            paid.setAlignment(Element.ALIGN_RIGHT);
            document.add(paid);

            Paragraph remaining = new Paragraph("Remaining:     Rs. " +
                    invoice.getTotalAmount()
                            .subtract(invoice.getPaidAmount())
                            .toPlainString(), totalFont);
            remaining.setAlignment(Element.ALIGN_RIGHT);
            document.add(remaining);

            // ── Footer ───────────────────────────────────────
            Paragraph footer = new Paragraph("\nThank you for choosing our hospital.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);

            document.close();

            log.info("PDF generated successfully for invoiceId: {}", invoiceId);

        } catch (Exception e) {
            log.error("Error generating PDF for invoiceId: {}", invoiceId, e);
            throw new BadRequestException("Error generating PDF: " + e.getMessage());
        }

        return out.toByteArray();
    }
}
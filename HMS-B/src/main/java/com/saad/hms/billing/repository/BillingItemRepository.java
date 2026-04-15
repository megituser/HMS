package com.saad.hms.billing.repository;

import com.saad.hms.billing.entity.BillingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillingItemRepository extends JpaRepository<BillingItem, Long> {
    List<BillingItem> findByInvoiceId(Long invoiceId);
}

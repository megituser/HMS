-- 🧾 INVOICES
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,

    total_amount DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,

    status VARCHAR(20) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    deleted BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_invoice_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_invoice_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- 🧾 BILLING ITEMS
CREATE TABLE billing_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    invoice_id BIGINT NOT NULL,

    description VARCHAR(255),
    amount DECIMAL(10,2),

    CONSTRAINT fk_billing_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- 💳 PAYMENTS
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    invoice_id BIGINT NOT NULL,

    amount_paid DECIMAL(10,2),
    payment_method VARCHAR(50),
    status VARCHAR(20),

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
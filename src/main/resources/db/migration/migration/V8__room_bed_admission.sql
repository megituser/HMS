-- ROOMS
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    floor VARCHAR(10) NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    department_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- BEDS
CREATE TABLE beds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bed_number VARCHAR(20) NOT NULL,
    bed_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    room_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bed_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT uq_bed_room UNIQUE (bed_number, room_id)
);

-- ADMISSIONS
CREATE TABLE admissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    bed_id BIGINT NOT NULL,
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'ADMITTED',
    reason VARCHAR(500),
    notes TEXT,
    discharge_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admission_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_admission_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_admission_bed FOREIGN KEY (bed_id) REFERENCES beds(id)
);
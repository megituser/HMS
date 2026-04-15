-- V1: Initial schema — foundational tables required by all subsequent migrations

-- ROLES
CREATE TABLE roles (
    id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- USERS
CREATE TABLE users (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    username   VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(150) UNIQUE,
    phone      VARCHAR(20),
    enabled    BOOLEAN DEFAULT TRUE,
    role_id    BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- DEPARTMENTS
CREATE TABLE departments (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- DOCTORS
CREATE TABLE doctors (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    phone            VARCHAR(20)  NOT NULL UNIQUE,
    email            VARCHAR(150),
    specialization   VARCHAR(100),
    experience_years INT,
    active           BOOLEAN DEFAULT TRUE,
    department_id    BIGINT NOT NULL,
    user_id          BIGINT UNIQUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_doctor_user       FOREIGN KEY (user_id)       REFERENCES users(id)
);

-- PATIENTS
CREATE TABLE patients (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    gender            VARCHAR(10),
    date_of_birth     DATE,
    phone             VARCHAR(20) NOT NULL,
    email             VARCHAR(150),
    address           VARCHAR(255),
    blood_group       VARCHAR(5),
    emergency_contact VARCHAR(20),
    active            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- APPOINTMENTS
CREATE TABLE appointments (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id       BIGINT       NOT NULL,
    doctor_id        BIGINT       NOT NULL,
    appointment_date DATE         NOT NULL,
    appointment_time TIME         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'BOOKED',
    notes            VARCHAR(500),
    active           BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)
);

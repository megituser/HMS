package com.saad.hms.medicalrecord.entity;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.doctor.entity.Doctor;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diagnosis;
    private String notes;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ SOFT DELETE FIELD
    @Column(nullable = false)
    private boolean deleted = false;

    // 🔗 RELATION WITH PATIENT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // 🔗 RELATION WITH DOCTOR
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

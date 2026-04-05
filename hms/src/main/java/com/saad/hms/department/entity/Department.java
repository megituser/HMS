package com.saad.hms.department.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.saad.hms.doctor.entity.Doctor;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "departments")
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;        // Cardiology, Neurology

    private String description;

    @Column(nullable = false)
    private boolean active = true;

    // 🔗 One Department → Many Doctors
    // Doctor entity me mapping hogi (mappedBy)
     @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
     @JsonIgnore
     private List<Doctor> doctors;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.saad.hms.patient.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PatientResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String gender;
    private LocalDate dateOfBirth;
    private String phone;
    private String email;
    private String address;
    private String bloodGroup;
    private String emergencyContact;
    private boolean active;
    private LocalDateTime createdAt;
}

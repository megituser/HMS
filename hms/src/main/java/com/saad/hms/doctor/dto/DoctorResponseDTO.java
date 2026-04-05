package com.saad.hms.doctor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String specialization;
    private Integer experienceYears;

    private Long departmentId;
    private String departmentName;

    private boolean active;
}

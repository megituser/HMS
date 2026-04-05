package com.saad.hms.doctor.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorRequestDTO {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    @NotNull(message = "User ID is required")
    private Long userId;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experienceYears;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}
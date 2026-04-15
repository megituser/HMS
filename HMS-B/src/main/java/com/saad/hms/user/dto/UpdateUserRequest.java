package com.saad.hms.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Email(message = "Invalid email format")
    private String email;

    // Optional but validated if present
    @Pattern(
            regexp = "ROLE_ADMIN|ROLE_DOCTOR|ROLE_RECEPTIONIST|ROLE_ACCOUNTANT",
            message = "Invalid role"
    )
    private String role;

    private Boolean enabled;
}
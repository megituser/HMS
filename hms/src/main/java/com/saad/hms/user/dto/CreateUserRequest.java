package com.saad.hms.user.dto;

import lombok.Data;

@Data
public class CreateUserRequest {

        private String username;
        private String password;
        private String email;
        private String role; // ROLE_DOCTOR, ROLE_RECEPTIONIST, ROLE_ACCOUNTANT
    }


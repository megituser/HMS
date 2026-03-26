package com.saad.hms.user.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
        private String email;
        private String role;
        private Boolean enabled;
    }


package com.saad.hms.department.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DepartmentResponseDTO {

    private Long id;
    private String name;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
}

package com.saad.hms.department.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentRequestDTO {

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
}

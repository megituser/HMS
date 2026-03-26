package com.saad.hms.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

     @Data
     public class UpdateDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String phone;


    private String email;
    private String specialization;
    private Integer experienceYears;

    @NotNull
    private Long departmentId;

}

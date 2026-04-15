package com.saad.hms.appointment.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponseDTO {

    private Long id;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    private String status;
    private String notes;
}

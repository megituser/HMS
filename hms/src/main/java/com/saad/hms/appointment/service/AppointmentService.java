package com.saad.hms.appointment.service;

import com.saad.hms.appointment.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AppointmentService {

    AppointmentResponseDTO createAppointment(AppointmentRequestDTO request);

    Page<AppointmentResponseDTO> getAllAppointments(Pageable pageable);

    List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId);

    List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId);

    AppointmentResponseDTO getAppointmentById(Long id);

    List<AppointmentResponseDTO> getAllAppointmentsForAdmin();

    List<AppointmentResponseDTO> getMyAppointments();

    void completeAppointment(Long id);



    void cancelAppointment(Long id);
}

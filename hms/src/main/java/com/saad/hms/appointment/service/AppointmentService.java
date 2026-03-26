package com.saad.hms.appointment.service;

import com.saad.hms.appointment.dto.*;

import java.util.List;

public interface AppointmentService {

    AppointmentResponseDTO createAppointment(AppointmentRequestDTO request);

    List<AppointmentResponseDTO> getAllAppointments();

    List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId);

    List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId);

    AppointmentResponseDTO getAppointmentById(Long id);

    List<AppointmentResponseDTO> getAllAppointmentsForAdmin();

    List<AppointmentResponseDTO> getMyAppointments();

    void completeAppointment(Long id);



    void cancelAppointment(Long id);
}

package com.saad.hms.appointment.service.impl;

import com.saad.hms.appointment.dto.*;
import com.saad.hms.appointment.entity.Appointment;
import com.saad.hms.appointment.repository.AppointmentRepository;
import com.saad.hms.appointment.service.AppointmentService;
import com.saad.hms.doctor.entity.Doctor;
import com.saad.hms.doctor.repository.DoctorRepository;
import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ForbiddenException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import com.saad.hms.user.entity.User;
import com.saad.hms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    @Override
    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO request) {

        if (request.getPatientId() == null || request.getDoctorId() == null) {
            throw new BadRequestException("Patient ID and Doctor ID are required");
        }

        Patient patient = patientRepository.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findByIdAndActiveTrue(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .notes(request.getNotes())
                .status("SCHEDULED")
                .build();

        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId) {

        if (patientId == null) {
            throw new BadRequestException("Patient ID is required");
        }

        return appointmentRepository.findByPatientIdAndActiveTrue(patientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {

        if (doctorId == null) {
            throw new BadRequestException("Doctor ID is required");
        }

        return appointmentRepository.findByDoctorIdAndActiveTrue(doctorId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AppointmentResponseDTO getAppointmentById(Long id) {

        if (id == null) {
            throw new BadRequestException("Appointment ID is required");
        }

        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        return mapToResponse(appointment);
    }

    @Override
    public List<AppointmentResponseDTO> getAllAppointmentsForAdmin() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void completeAppointment(Long id) {

        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        if (!appt.getDoctor().getUser().getUsername().equals(username)) {
            throw new ForbiddenException("You can only complete your own appointments");
        }

        appt.setStatus("COMPLETED");
        appointmentRepository.save(appt);
    }

    @Override
    public List<AppointmentResponseDTO> getMyAppointments() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return appointmentRepository.findByDoctorIdAndActiveTrue(doctor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void cancelAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.isActive()) {
            throw new BadRequestException("Appointment already cancelled");
        }

        appointment.setStatus("CANCELLED");
        appointment.setActive(false);
        appointmentRepository.save(appointment);
    }

    private AppointmentResponseDTO mapToResponse(Appointment appointment) {
        return AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(
                        appointment.getPatient().getFirstName() + " " +
                                appointment.getPatient().getLastName()
                )
                .doctorId(appointment.getDoctor().getId())
                .doctorName(
                        appointment.getDoctor().getFirstName() + " " +
                                appointment.getDoctor().getLastName()
                )
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .build();
    }
}
package com.saad.hms.appointment.service.impl;

import com.saad.hms.appointment.dto.*;
import com.saad.hms.appointment.entity.Appointment;
import com.saad.hms.appointment.repository.AppointmentRepository;
import com.saad.hms.appointment.service.AppointmentService;
import com.saad.hms.doctor.entity.Doctor;
import com.saad.hms.doctor.repository.DoctorRepository;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import com.saad.hms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import com.saad.hms.user.entity.User;
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

        Patient patient = patientRepository.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findByIdAndActiveTrue(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
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
        return appointmentRepository.findByPatientIdAndActiveTrue(patientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdAndActiveTrue(doctorId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

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
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        if (!appt.getDoctor().getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not your appointment");
        }

        appt.setStatus("COMPLETED");
        appointmentRepository.save(appt);
    }


    @Override
    public List<AppointmentResponseDTO> getMyAppointments() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return appointmentRepository.findByDoctorIdAndActiveTrue(doctor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }



    @Override
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.isActive()) {
            return; // already cancelled → silently ignore
        }
        appointment.setStatus("CANCELLED");
        appointment.setActive(false);
        appointmentRepository.save(appointment);
    }


        private AppointmentResponseDTO mapToResponse (Appointment appointment){
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

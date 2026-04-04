package com.saad.hms.appointment.repository;

import com.saad.hms.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByActiveTrue(Pageable pageable);

    Optional<Appointment> findByIdAndActiveTrue(Long id);

    List<Appointment> findByPatientIdAndActiveTrue(Long patientId);

    List<Appointment> findByDoctorIdAndActiveTrue(Long doctorId);

    List<Appointment> findAll();

}

package com.saad.hms;
import com.saad.hms.appointment.repository.AppointmentRepository;
import com.saad.hms.department.repository.DepartmentRepository;
import com.saad.hms.doctor.repository.DoctorRepository;
import com.saad.hms.patient.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    @Autowired private DoctorRepository doctorRepo;
    @Autowired private PatientRepository patientRepo;
    @Autowired private AppointmentRepository appointmentRepo;
    @Autowired private DepartmentRepository departmentRepo;

    @GetMapping
    public Map<String, Long> getStats() {
        Map<String, Long> data = new HashMap<>();

        data.put("doctors", doctorRepo.count());
        data.put("patients", patientRepo.count());
        data.put("appointments", appointmentRepo.count());
        data.put("departments", departmentRepo.count());

        return data;
    }
}
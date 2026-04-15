package com.saad.hms.appointment;

import com.saad.hms.HMSIntegrationTest;
import com.saad.hms.appointment.dto.AppointmentRequestDTO;
import com.saad.hms.appointment.dto.AppointmentResponseDTO;
import com.saad.hms.appointment.service.AppointmentService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AppointmentControllerTest extends HMSIntegrationTest {

    @MockBean
    private AppointmentService appointmentService;

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void createAppointment_ValidRequest_ShouldReturn201() throws Exception {
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setPatientId(1L);
        request.setDoctorId(2L);
        request.setAppointmentDate(LocalDate.now());
        request.setAppointmentTime(LocalTime.of(10, 30));
        request.setNotes("Checkup");

        AppointmentResponseDTO response = AppointmentResponseDTO.builder()
                .id(1L)
                .patientId(1L)
                .doctorId(2L)
                .status("SCHEDULED")
                .build();

        given(appointmentService.createAppointment(any(AppointmentRequestDTO.class))).willReturn(response);

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("SCHEDULED"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createAppointment_InvalidRole_ShouldReturn403() throws Exception {
        AppointmentRequestDTO request = new AppointmentRequestDTO();

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createAppointment_NoAuth_ShouldReturn401() throws Exception {
        AppointmentRequestDTO request = new AppointmentRequestDTO();

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void getAppointments_ShouldReturn200() throws Exception {
        AppointmentResponseDTO response = AppointmentResponseDTO.builder().id(1L).build();
        Page<AppointmentResponseDTO> page = new PageImpl<>(Collections.singletonList(response));
        
        given(appointmentService.getAllAppointments(any(Pageable.class))).willReturn(page);

        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void completeAppointment_AsReceptionist_ShouldReturn403() throws Exception {
        mockMvc.perform(put("/api/appointments/1/complete"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void completeAppointment_AsDoctor_ShouldReturn200() throws Exception {
        mockMvc.perform(put("/api/appointments/1/complete"))
            .andExpect(status().isOk());
    }
}

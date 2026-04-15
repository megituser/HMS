package com.saad.hms.doctor;

import com.saad.hms.HMSIntegrationTest;
import com.saad.hms.doctor.dto.DoctorRequestDTO;
import com.saad.hms.doctor.dto.DoctorResponseDTO;
import com.saad.hms.doctor.service.DoctorService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DoctorControllerTest extends HMSIntegrationTest {

    @MockBean
    private DoctorService doctorService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createDoctor_ValidRequest_ShouldReturn201() throws Exception {
        DoctorRequestDTO request = new DoctorRequestDTO();
        request.setFirstName("Sarah");
        request.setLastName("Connor");
        request.setPhone("1234567890");
        request.setSpecialization("Cardiology");
        request.setExperienceYears(10);
        request.setDepartmentId(1L);
        request.setUserId(2L);

        DoctorResponseDTO response = DoctorResponseDTO.builder()
                .id(1L)
                .firstName("Sarah")
                .lastName("Connor")
                .specialization("Cardiology")
                .build();

        given(doctorService.createDoctor(any(DoctorRequestDTO.class))).willReturn(response);

        mockMvc.perform(post("/api/doctors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.specialization").value("Cardiology"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createDoctor_MissingRequiredFields_ShouldReturn400() throws Exception {
        DoctorRequestDTO request = new DoctorRequestDTO();
        // Missing firstName, lastName, phone, etc.

        mockMvc.perform(post("/api/doctors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.firstName").exists());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void getAllDoctors_ShouldReturn200() throws Exception {
        DoctorResponseDTO doc = DoctorResponseDTO.builder().id(1L).firstName("Dr. Smith").build();
        Page<DoctorResponseDTO> page = new PageImpl<>(Collections.singletonList(doc));

        given(doctorService.getAllDoctors(any(Pageable.class))).willReturn(page);

        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("Dr. Smith"));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getMyProfile_ShouldReturn200() throws Exception {
        DoctorResponseDTO doc = DoctorResponseDTO.builder().id(1L).firstName("Self").build();
        given(doctorService.getMyProfile()).willReturn(doc);

        mockMvc.perform(get("/api/doctors/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Self"));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void createDoctor_WithDoctorRole_ShouldReturn403() throws Exception {
        DoctorRequestDTO request = new DoctorRequestDTO();
        request.setFirstName("John"); // minimal setup
        
        mockMvc.perform(post("/api/doctors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void updateDoctor_AsReceptionist_ShouldReturn403() throws Exception {
        com.saad.hms.doctor.dto.UpdateDTO request = new com.saad.hms.doctor.dto.UpdateDTO();
        
        mockMvc.perform(put("/api/doctors/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void deleteDoctor_AsReceptionist_ShouldReturn403() throws Exception {
        mockMvc.perform(delete("/api/doctors/1"))
            .andExpect(status().isForbidden());
    }
}

package com.saad.hms.patient;

import com.saad.hms.HMSIntegrationTest;
import com.saad.hms.patient.dto.PatientRequestDTO;
import com.saad.hms.patient.dto.PatientResponseDTO;
import com.saad.hms.patient.entity.Gender;
import com.saad.hms.patient.service.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PatientControllerTest extends HMSIntegrationTest {

    @MockBean
    private PatientService patientService;

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void createPatient_ValidRequest_ShouldReturn201() throws Exception {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setGender(Gender.MALE);
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setPhone("1234567890");
        request.setEmail("john@example.com");

        PatientResponseDTO response = PatientResponseDTO.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .gender(Gender.MALE)
                .build();

        given(patientService.createPatient(any(PatientRequestDTO.class))).willReturn(response);

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void createPatient_MissingRequiredFields_ShouldReturn400() throws Exception {
        PatientRequestDTO request = new PatientRequestDTO();
        // Missing firstName, lastName, phone

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.lastName").exists())
                .andExpect(jsonPath("$.errors.phone").exists());
    }

    @Test
    void createPatient_WithoutJwt_ShouldReturn401() throws Exception {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setFirstName("John");

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER") // Incorrect role
    void createPatient_WithInvalidRole_ShouldReturn403() throws Exception {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("1234567890");

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void getPatientById_ShouldReturn200() throws Exception {
        PatientResponseDTO response = PatientResponseDTO.builder()
                .id(1L)
                .firstName("John")
                .build();

        given(patientService.getPatientById(1L)).willReturn(response);

        mockMvc.perform(get("/api/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void getAllPatients_ShouldReturnPaginatedList() throws Exception {
        PatientResponseDTO response = PatientResponseDTO.builder()
                .id(1L)
                .firstName("John")
                .build();
        Page<PatientResponseDTO> page = new PageImpl<>(Collections.singletonList(response));
        given(patientService.getAllActivePatients(any(Pageable.class))).willReturn(page);

        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deletePatient_AsAdmin_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/patients/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST") // Receptionist cannot delete
    void deletePatient_AsReceptionist_ShouldReturn403() throws Exception {
        mockMvc.perform(delete("/api/patients/1"))
                .andExpect(status().isForbidden());
    }
}

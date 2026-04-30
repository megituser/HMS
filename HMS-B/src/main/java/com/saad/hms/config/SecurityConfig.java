package com.saad.hms.config;

import com.saad.hms.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtFilter;
        private final JwtAuthenticationEntryPoint entryPoint;
        private final CustomAccessDeniedHandler deniedHandler;
        private final CorsConfigurationSource corsConfigurationSource;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(entryPoint)
                                                .accessDeniedHandler(deniedHandler))

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(OPTIONS, "/**").permitAll()

                                                // ─── SWAGGER ────────────────────────────────────────
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**",
                                                                "/v3/api-docs")
                                                .permitAll()

                                                // ─── AUTH ────────────────────────────────────────────
                                                .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                                                .requestMatchers("/api/auth/logout").authenticated()

                                                // ─── USERS ───────────────────────────────────────────
                                                // Only ADMIN can manage system users
                                                .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")

                                                // ─── DASHBOARD ───────────────────────────────────────
                                                .requestMatchers(GET, "/api/dashboard/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT")

                                                // ─── PATIENTS ────────────────────────────────────────
                                                // All clinical staff and accountants can view patients
                                                .requestMatchers(GET, "/api/patients/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "ACCOUNTANT")
                                                // ADMIN and RECEPTIONIST can register new patients
                                                .requestMatchers(POST, "/api/patients/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST")
                                                // ADMIN, RECEPTIONIST and NURSE can update patient info
                                                .requestMatchers(PUT, "/api/patients/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "NURSE")
                                                // Only ADMIN can delete patients
                                                .requestMatchers(DELETE, "/api/patients/**")
                                                .hasRole("ADMIN")

                                                // ─── DOCTORS ─────────────────────────────────────────
                                                // Doctor's own profile endpoint (must come before /**)
                                                .requestMatchers(GET, "/api/doctors/me")
                                                .hasRole("DOCTOR")
                                                // All clinical staff can view doctors list
                                                .requestMatchers(GET, "/api/doctors/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE")
                                                // ADMIN and RECEPTIONIST can register doctors
                                                .requestMatchers(POST, "/api/doctors/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST")
                                                // Only ADMIN can update or delete doctor records
                                                .requestMatchers(PUT, "/api/doctors/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(DELETE, "/api/doctors/**")
                                                .hasRole("ADMIN")

                                                // ─── APPOINTMENTS ────────────────────────────────────
                                                // Doctor's own appointments (must come before /**)
                                                .requestMatchers(GET, "/api/appointments/my")
                                                .hasRole("DOCTOR")
                                                // All clinical staff can view appointments
                                                .requestMatchers(GET, "/api/appointments/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT")
                                                // ADMIN, DOCTOR and RECEPTIONIST can book appointments
                                                .requestMatchers(POST, "/api/appointments/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                                                // ADMIN and DOCTOR can update appointment status
                                                .requestMatchers(PUT, "/api/appointments/**")
                                                .hasAnyRole("ADMIN", "DOCTOR")
                                                // ADMIN, DOCTOR and RECEPTIONIST can cancel appointments
                                                .requestMatchers(DELETE, "/api/appointments/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                                                // ─── MEDICAL RECORDS ─────────────────────────────────
                                                // Doctor's own medical records (must come before /**)
                                                .requestMatchers(GET, "/api/medical-records/my")
                                                .hasRole("DOCTOR")
                                                // ADMIN, DOCTOR, and NURSE can view all medical records
                                                .requestMatchers(GET, "/api/medical-records/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "NURSE")
                                                // DOCTOR and NURSE can create medical records
                                                .requestMatchers(POST, "/api/medical-records/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "NURSE")
                                                // DOCTOR and NURSE can update medical records
                                                .requestMatchers(PUT, "/api/medical-records/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "NURSE")
                                                // Only ADMIN can delete medical records
                                                .requestMatchers(DELETE, "/api/medical-records/**")
                                                .hasRole("ADMIN")

                                                // ─── BILLING & INVOICES ───────────────────────────────
                                                // PDF export for clinical + billing staff
                                                .requestMatchers(GET, "/api/invoices/*/pdf")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR", "ACCOUNTANT")
                                                // All billing-relevant staff can view invoices
                                                .requestMatchers(GET, "/api/invoices/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR", "ACCOUNTANT")
                                                // ADMIN, RECEPTIONIST and ACCOUNTANT can create invoices
                                                .requestMatchers(POST, "/api/invoices/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "ACCOUNTANT")
                                                // ADMIN and ACCOUNTANT can update invoices
                                                .requestMatchers(PUT, "/api/invoices/**")
                                                .hasAnyRole("ADMIN", "ACCOUNTANT")
                                                // Only ADMIN can delete invoices
                                                .requestMatchers(DELETE, "/api/invoices/**")
                                                .hasRole("ADMIN")

                                                // ─── DEPARTMENTS ──────────────────────────────────────
                                                // All staff can view departments
                                                .requestMatchers(GET, "/api/departments/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT")
                                                // Only ADMIN can manage departments
                                                .requestMatchers(POST, "/api/departments/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(PUT, "/api/departments/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(DELETE, "/api/departments/**")
                                                .hasRole("ADMIN")

                                                // ─── ROOMS ────────────────────────────────────────────
                                                // Clinical staff and accountants can view rooms
                                                .requestMatchers(GET, "/api/rooms/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT")
                                                // Only ADMIN can manage rooms
                                                .requestMatchers(POST, "/api/rooms/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(PUT, "/api/rooms/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(DELETE, "/api/rooms/**")
                                                .hasRole("ADMIN")

                                                // ─── BEDS ─────────────────────────────────────────────
                                                // Clinical staff and accountants can view beds
                                                .requestMatchers(GET, "/api/beds/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT")
                                                // Only ADMIN can create/delete beds
                                                .requestMatchers(POST, "/api/beds/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(DELETE, "/api/beds/**")
                                                .hasRole("ADMIN")
                                                // ADMIN, RECEPTIONIST, and NURSE can update bed status (assign/release)
                                                .requestMatchers(PUT, "/api/beds/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "NURSE")
                                                .requestMatchers(PATCH, "/api/beds/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST", "NURSE")

                                                // ─── ADMISSIONS ───────────────────────────────────────
                                                // All clinical staff and accountants can view admissions
                                                .requestMatchers(GET, "/api/admissions/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT")
                                                // ADMIN and RECEPTIONIST can create admissions
                                                .requestMatchers(POST, "/api/admissions/**")
                                                .hasAnyRole("ADMIN", "RECEPTIONIST")
                                                // ADMIN, DOCTOR and RECEPTIONIST can update admission status
                                                .requestMatchers(PUT, "/api/admissions/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                                                .requestMatchers(PATCH, "/api/admissions/**")
                                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                                                // Only ADMIN can delete admissions
                                                .requestMatchers(DELETE, "/api/admissions/**")
                                                .hasRole("ADMIN")

                                                // ─── REPORTS ──────────────────────────────────────────
                                                // Only ADMIN and ACCOUNTANT can access reports
                                                .requestMatchers("/api/reports/**")
                                                .hasAnyRole("ADMIN", "ACCOUNTANT")

                                                // ─── FALLBACK ─────────────────────────────────────────
                                                .anyRequest().authenticated())

                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
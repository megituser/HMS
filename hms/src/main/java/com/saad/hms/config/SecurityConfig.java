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

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JwtAuthenticationEntryPoint entryPoint;
    private final CustomAccessDeniedHandler deniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 🔥 GLOBAL EXCEPTION HANDLING (VERY IMPORTANT)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(deniedHandler)
                )

                .authorizeHttpRequests(auth -> auth


                        // SWAGGER
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs"
                        ).permitAll()


                        // AUTH
                        .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                        .requestMatchers("/api/auth/logout").authenticated()

                        // USERS (ADMIN)
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // PATIENTS
                        .requestMatchers(HttpMethod.GET, "/api/patients/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/patients/**")
                        .hasAnyRole("DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.PUT, "/api/patients/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**")
                        .hasRole("ADMIN")

                        // DOCTORS
                        .requestMatchers(HttpMethod.GET, "/api/doctors/me")
                        .hasRole("DOCTOR")

                        .requestMatchers(HttpMethod.GET, "/api/doctors/**")
                        .hasAnyRole("ADMIN","RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/doctors/**")
                        .hasAnyRole("ADMIN","RECEPTIONIST")

                        .requestMatchers(HttpMethod.PUT, "/api/doctors/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/**")
                        .hasRole("ADMIN")

                        // APPOINTMENTS
                        .requestMatchers(HttpMethod.GET, "/api/appointments/my")
                        .hasRole("DOCTOR")

                        .requestMatchers(HttpMethod.GET, "/api/appointments/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/appointments/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                        .hasAnyRole("ADMIN","DOCTOR")

                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        // MEDICAL RECORDS
                        .requestMatchers(HttpMethod.GET, "/api/medical-records/my")
                        .hasRole("DOCTOR")

                        .requestMatchers(HttpMethod.GET, "/api/medical-records/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/medical-records/**")
                        .hasRole("DOCTOR")

                        .requestMatchers(HttpMethod.DELETE, "/api/medical-records/**")
                        .hasRole("ADMIN")

                        // 🔥 BILLING (ORDER FIXED)
                        .requestMatchers(HttpMethod.GET, "/api/invoices/*/pdf")
                        .hasAnyRole("ADMIN","RECEPTIONIST","DOCTOR")

                        .requestMatchers(HttpMethod.GET, "/api/invoices/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/invoices/**")
                        .hasAnyRole("ADMIN","RECEPTIONIST")

                        // DEPARTMENTS
                        .requestMatchers(HttpMethod.GET, "/api/departments/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/departments")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/departments/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**")
                        .hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                // 🔥 JWT FILTER (BEAN)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}


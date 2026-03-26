package com.saad.hms.config;

import com.saad.hms.security.CustomUserDetailsService;
import com.saad.hms.security.JwtAuthenticationFilter;
import com.saad.hms.security.JwtUtils;
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

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtUtils, userDetailsService);

        http
                // Disable CSRF (JWT is stateless)
                .csrf(csrf -> csrf.disable())

                // Enable CORS (default)
                .cors(cors -> {})

                // Stateless session (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // USER MANAGEMENT (ADMIN ONLY)
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/available-doctors")
                        .hasRole("ADMIN")


                        // PATIENT MANAGEMENT
                        .requestMatchers(HttpMethod.GET, "/api/patients/**")
                        .hasAnyRole("ADMIN","DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/patients/**")
                        .hasAnyRole("DOCTOR","RECEPTIONIST")

                        .requestMatchers(HttpMethod.PUT, "/api/patients/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**")
                        .hasRole("ADMIN")

                        /* ================= DOCTOR DASHBOARD ================= */

                        // Doctor → apni profile
                        .requestMatchers(HttpMethod.GET, "/api/doctors/me")
                        .hasRole("DOCTOR")

                        // Doctor → apni appointments
                        .requestMatchers(HttpMethod.GET, "/api/appointments/my")
                        .hasRole("DOCTOR")

                        // Doctor → appointment complete
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*/complete")
                        .hasRole("DOCTOR")

                        // Doctor → apne patients (future use)
                        .requestMatchers(HttpMethod.GET, "/api/patients/my")
                        .hasRole("DOCTOR")


                        // DOCTOR MANAGEMENT
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**").hasAnyRole("ADMIN","RECEPTIONIST")
                        .requestMatchers(HttpMethod.POST, "/api/doctors/**").hasAnyRole("ADMIN","RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/**").hasRole("ADMIN")



                                // ================= APPOINTMENTS =================

                                 //  Doctor → only HIS appointments
                                .requestMatchers(HttpMethod.GET, "/api/appointments/my")
                                .hasRole("DOCTOR")

                                // View appointments
                                .requestMatchers(HttpMethod.GET, "/api/appointments/**")
                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                                //  Create appointment
                                .requestMatchers(HttpMethod.POST, "/api/appointments/**")
                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                                 //  Update / Complete appointment
                                .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                                .hasAnyRole("ADMIN", "DOCTOR")

                                 //  Cancel appointment
                                .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                                .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                                /* ================= DEPARTMENTS ================= */

                        // View departments (Admin, Doctor, Receptionist)
                        .requestMatchers(HttpMethod.GET, "/api/departments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                        // Create department (Admin only)
                        .requestMatchers(HttpMethod.POST, "/api/departments")
                        .hasRole("ADMIN")

                        // Update department (Admin only)
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**")
                        .hasRole("ADMIN")

                        // Delete / deactivate department (Admin only)
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**")
                        .hasRole("ADMIN")

                        /* ================= OTHERS ================= */
                        .anyRequest().authenticated()
                )



                // JWT filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }
}

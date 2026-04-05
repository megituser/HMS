package com.saad.hms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {

        // defines the "Bearer Auth" button in Swagger UI
        SecurityScheme securityScheme = new SecurityScheme()
                .name("Bearer Auth")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");

        return new OpenAPI()
                .info(new Info()
                        .title("Hospital Management System API")
                        .description("REST API for HMS — patients, doctors, appointments, billing")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Saad")
                                .email("admin@hms.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth", securityScheme));
    }
}
package com.saad.hms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // 👇 Frontend origin
        config.setAllowedOrigins(List.of(
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:5173",
                "http://localhost:3000",
                "https://hms-frontend-lime-one.vercel.app",
                "https://hms-dun-phi.vercel.app"
        ));

        // 👇 HTTP methods allowed
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // 👇 Headers allowed (JWT ke liye required)
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        // 👇 JWT ke liye important
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}

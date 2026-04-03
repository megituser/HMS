package com.saad.hms.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        response.getWriter().write("""
        {
            "status": 403,
            "error": "Access Denied",
            "path": "%s"
        }
        """.formatted(request.getRequestURI()));
    }
}
package com.saad.hms.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        log.warn("Resource not found: {} | path: {}", ex.getMessage(), request.getRequestURI());

        return ResponseEntity.status(404).body(ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(404)
                .error(ex.getMessage())
                .path(request.getRequestURI())
                .build());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(
            BadRequestException ex,
            HttpServletRequest request) {

        log.warn("Bad request: {} | path: {}", ex.getMessage(), request.getRequestURI());

        return ResponseEntity.badRequest().body(ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .error(ex.getMessage())
                .path(request.getRequestURI())
                .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );

        log.warn("Validation failed at: {} | errors: {}", request.getRequestURI(), errors);

        return ResponseEntity.badRequest().body(ValidationError.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .errors(errors)
                .path(request.getRequestURI())
                .build());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(
            UnauthorizedException ex,
            HttpServletRequest request) {

        log.warn("Unauthorized: {} | path: {}", ex.getMessage(), request.getRequestURI());

        return ResponseEntity.status(401).body(ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(401)
                .error(ex.getMessage())
                .path(request.getRequestURI())
                .build());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbidden(
            ForbiddenException ex,
            HttpServletRequest request) {

        log.warn("Forbidden: {} | path: {}", ex.getMessage(), request.getRequestURI());

        return ResponseEntity.status(403).body(ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(403)
                .error(ex.getMessage())
                .path(request.getRequestURI())
                .build());
    }

    // 500 - log full stack trace for unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unexpected error at: {} | message: {}", request.getRequestURI(), ex.getMessage(), ex);

        return ResponseEntity.status(500).body(ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(500)
                .error("Internal Server Error")
                .path(request.getRequestURI())
                .build());
    }
}
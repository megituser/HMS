package com.saad.hms.exception;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class ValidationError {

    private LocalDateTime timestamp;
    private int status;
    private Map<String, String> errors;
    private String path;
}

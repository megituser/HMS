package com.saad.hms.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BedRequestDTO {

    @NotBlank(message = "Bed number is required")
    private String bedNumber;

    @NotNull(message = "Bed type is required")
    private String bedType;

    @NotNull(message = "Room ID is required")
    private Long roomId;
}
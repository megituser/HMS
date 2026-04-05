package com.saad.hms.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequestDTO {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Floor is required")
    private String floor;

    @NotBlank(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}
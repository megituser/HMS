package com.saad.hms.room.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BedResponseDTO {
    private Long id;
    private String bedNumber;
    private String bedType;
    private String status;
    private boolean active;
    private Long roomId;
    private String roomNumber;
    private String floor;
    private Long departmentId;
    private String departmentName;
}
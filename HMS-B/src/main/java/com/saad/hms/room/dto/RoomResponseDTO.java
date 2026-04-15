package com.saad.hms.room.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponseDTO {
    private Long id;
    private String roomNumber;
    private String floor;
    private String roomType;
    private boolean active;
    private Long departmentId;
    private String departmentName;
    private long totalBeds;
    private long availableBeds;
}
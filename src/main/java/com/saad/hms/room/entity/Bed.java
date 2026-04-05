package com.saad.hms.room.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "beds",
        uniqueConstraints = @UniqueConstraint(columnNames = {"bed_number", "room_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bed_number", nullable = false)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BedType bedType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BedStatus status = BedStatus.AVAILABLE;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
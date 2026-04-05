package com.saad.hms.room.repository;

import com.saad.hms.room.entity.Bed;
import com.saad.hms.room.entity.BedStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BedRepository extends JpaRepository<Bed, Long> {

    Page<Bed> findByActiveTrue(Pageable pageable);

    List<Bed> findByRoomIdAndActiveTrue(Long roomId);

    List<Bed> findByStatusAndActiveTrue(BedStatus status);

    Optional<Bed> findByIdAndActiveTrue(Long id);

    boolean existsByBedNumberAndRoomId(String bedNumber, Long roomId);

    long countByRoomIdAndActiveTrue(Long roomId);

    long countByRoomIdAndStatusAndActiveTrue(Long roomId, BedStatus status);

    @Query("SELECT b FROM Bed b WHERE b.room.department.id = :departmentId AND b.status = :status AND b.active = true")
    List<Bed> findAvailableBedsByDepartment(Long departmentId, BedStatus status);
}
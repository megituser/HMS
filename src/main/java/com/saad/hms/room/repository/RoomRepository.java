package com.saad.hms.room.repository;

import com.saad.hms.room.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Page<Room> findByActiveTrue(Pageable pageable);

    List<Room> findByDepartmentIdAndActiveTrue(Long departmentId);

    Optional<Room> findByIdAndActiveTrue(Long id);

    boolean existsByRoomNumber(String roomNumber);
}
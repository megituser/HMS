package com.saad.hms.doctor.repository;

import com.saad.hms.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Page<Doctor> findByActiveTrue(Pageable pageable);

    Optional<Doctor> findByIdAndActiveTrue(Long id);

    List<Doctor> findByDepartmentIdAndActiveTrue(Long departmentId);

    Optional<Doctor> findByUserUsername(String username);

    boolean existsByPhone(String phone);

    // ✅ ADMIN & RECEPTIONIST → ALL doctors with department
    @Query("SELECT d FROM Doctor d JOIN FETCH d.department WHERE d.active = true")
    List<Doctor> findAllActiveWithDepartment();

    boolean existsByUserId(Long userId);

    Optional<Doctor> findByUserId(Long userId);


}

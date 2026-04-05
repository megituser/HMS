package com.saad.hms.department.repository;

import com.saad.hms.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByActiveTrue();

    Optional<Department> findByIdAndActiveTrue(Long id);

    boolean existsByNameIgnoreCase(String name);
}

package com.saad.hms.room.service;

import com.saad.hms.department.entity.Department;
import com.saad.hms.department.repository.DepartmentRepository;
import com.saad.hms.doctor.entity.Doctor;
import com.saad.hms.doctor.repository.DoctorRepository;
import com.saad.hms.exception.BadRequestException;
import com.saad.hms.exception.ResourceNotFoundException;
import com.saad.hms.patient.entity.Patient;
import com.saad.hms.patient.repository.PatientRepository;
import com.saad.hms.room.dto.*;
import com.saad.hms.room.entity.*;
import com.saad.hms.room.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RoomBedService {

    private final RoomRepository roomRepo;
    private final BedRepository bedRepo;
    private final AdmissionRepository admissionRepo;
    private final DepartmentRepository departmentRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;

    // ─── ROOM ────────────────────────────────────────────

    public RoomResponseDTO createRoom(RoomRequestDTO request) {

        if (roomRepo.existsByRoomNumber(request.getRoomNumber())) {
            throw new BadRequestException("Room number already exists: " + request.getRoomNumber());
        }

        Department department = departmentRepo.findByIdAndActiveTrue(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        log.info("Creating room: {} in department: {}", request.getRoomNumber(), department.getName());

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber())
                .floor(request.getFloor())
                .roomType(request.getRoomType())
                .department(department)
                .build();

        Room saved = roomRepo.save(room);
        log.info("Room created with id: {}", saved.getId());

        return mapRoom(saved);
    }

    public Page<RoomResponseDTO> getAllRooms(Pageable pageable) {
        log.debug("Fetching all rooms - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return roomRepo.findByActiveTrue(pageable).map(this::mapRoom);
    }

    public RoomResponseDTO getRoomById(Long id) {
        Room room = roomRepo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        return mapRoom(room);
    }

    public List<RoomResponseDTO> getRoomsByDepartment(Long departmentId) {
        log.debug("Fetching rooms for departmentId: {}", departmentId);
        return roomRepo.findByDepartmentIdAndActiveTrue(departmentId)
                .stream().map(this::mapRoom).toList();
    }

    public void deactivateRoom(Long id) {
        Room room = roomRepo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        boolean hasOccupiedBeds = room.getBeds() != null &&
                room.getBeds().stream()
                        .anyMatch(b -> b.getStatus() == BedStatus.OCCUPIED);

        if (hasOccupiedBeds) {
            throw new BadRequestException("Cannot deactivate room with occupied beds");
        }

        log.info("Deactivating room id: {}", id);
        room.setActive(false);
        roomRepo.save(room);
    }

    // ─── BED ─────────────────────────────────────────────

    public BedResponseDTO createBed(BedRequestDTO request) {

        Room room = roomRepo.findByIdAndActiveTrue(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (bedRepo.existsByBedNumberAndRoomId(request.getBedNumber(), request.getRoomId())) {
            throw new BadRequestException("Bed number already exists in this room");
        }

        BedType bedType;
        try {
            bedType = BedType.valueOf(request.getBedType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid bed type. Allowed: GENERAL, PRIVATE, ICU, EMERGENCY");
        }

        log.info("Creating bed: {} in room: {}", request.getBedNumber(), room.getRoomNumber());

        Bed bed = Bed.builder()
                .bedNumber(request.getBedNumber())
                .bedType(bedType)
                .status(BedStatus.AVAILABLE)
                .room(room)
                .build();

        Bed saved = bedRepo.save(bed);
        log.info("Bed created with id: {}", saved.getId());

        return mapBed(saved);
    }

    public Page<BedResponseDTO> getAllBeds(Pageable pageable) {
        return bedRepo.findByActiveTrue(pageable).map(this::mapBed);
    }

    public List<BedResponseDTO> getBedsByRoom(Long roomId) {
        return bedRepo.findByRoomIdAndActiveTrue(roomId)
                .stream().map(this::mapBed).toList();
    }

    public List<BedResponseDTO> getAvailableBeds() {
        log.debug("Fetching all available beds");
        return bedRepo.findByStatusAndActiveTrue(BedStatus.AVAILABLE)
                .stream().map(this::mapBed).toList();
    }

    public List<BedResponseDTO> getAvailableBedsByDepartment(Long departmentId) {
        log.debug("Fetching available beds for departmentId: {}", departmentId);
        return bedRepo.findAvailableBedsByDepartment(departmentId, BedStatus.AVAILABLE)
                .stream().map(this::mapBed).toList();
    }

    public BedResponseDTO updateBedStatus(Long bedId, String status) {
        Bed bed = bedRepo.findByIdAndActiveTrue(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));

        BedStatus bedStatus;
        try {
            bedStatus = BedStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status. Allowed: AVAILABLE, OCCUPIED, MAINTENANCE");
        }

        if (bed.getStatus() == BedStatus.OCCUPIED && bedStatus == BedStatus.MAINTENANCE) {
            throw new BadRequestException("Cannot set occupied bed to maintenance. Discharge patient first.");
        }

        log.info("Updating bed {} status to {}", bedId, bedStatus);
        bed.setStatus(bedStatus);
        return mapBed(bedRepo.save(bed));
    }

    public void deactivateBed(Long id) {
        Bed bed = bedRepo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));

        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new BadRequestException("Cannot deactivate an occupied bed");
        }

        log.info("Deactivating bed id: {}", id);
        bed.setActive(false);
        bedRepo.save(bed);
    }

    // ─── ADMISSION ───────────────────────────────────────

    public AdmissionResponseDTO admitPatient(AdmissionRequestDTO request) {

        Patient patient = patientRepo.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepo.findByIdAndActiveTrue(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Bed bed = bedRepo.findByIdAndActiveTrue(request.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));

        // check bed is available
        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new BadRequestException("Bed is not available. Current status: " + bed.getStatus());
        }

        // check patient not already admitted
        if (admissionRepo.existsByBedIdAndStatus(request.getBedId(), AdmissionStatus.ADMITTED)) {
            throw new BadRequestException("This bed is already occupied");
        }

        if (admissionRepo.findByPatientIdAndStatus(request.getPatientId(), AdmissionStatus.ADMITTED).isPresent()) {
            throw new BadRequestException("Patient is already admitted in another bed");
        }

        log.info("Admitting patientId: {} to bedId: {} by doctorId: {}",
                request.getPatientId(), request.getBedId(), request.getDoctorId());

        Admission admission = Admission.builder()
                .patient(patient)
                .doctor(doctor)
                .bed(bed)
                .admissionDate(request.getAdmissionDate())
                .reason(request.getReason())
                .notes(request.getNotes())
                .status(AdmissionStatus.ADMITTED)
                .build();

        admissionRepo.save(admission);

        // mark bed as occupied
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepo.save(bed);

        log.info("Patient admitted. Admission id: {}", admission.getId());

        return mapAdmission(admission);
    }

    public AdmissionResponseDTO dischargePatient(Long admissionId, DischargeRequestDTO request) {

        Admission admission = admissionRepo.findById(admissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));

        if (admission.getStatus() != AdmissionStatus.ADMITTED) {
            throw new BadRequestException("Patient is not currently admitted");
        }

        log.info("Discharging patient from admissionId: {}", admissionId);

        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargeDate(LocalDateTime.now());
        admission.setDischargeSummary(request.getDischargeSummary());
        if (request.getNotes() != null) {
            admission.setNotes(request.getNotes());
        }

        admissionRepo.save(admission);

        // free the bed
        Bed bed = admission.getBed();
        bed.setStatus(BedStatus.AVAILABLE);
        bedRepo.save(bed);

        log.info("Patient discharged. Bed {} is now available.", bed.getBedNumber());

        return mapAdmission(admission);
    }

    public Page<AdmissionResponseDTO> getAllAdmissions(Pageable pageable) {
        return admissionRepo.findAll(pageable).map(this::mapAdmission);
    }

    public List<AdmissionResponseDTO> getAdmissionsByPatient(Long patientId) {
        log.debug("Fetching admissions for patientId: {}", patientId);
        return admissionRepo.findByPatientId(patientId)
                .stream().map(this::mapAdmission).toList();
    }

    public List<AdmissionResponseDTO> getCurrentlyAdmitted() {
        log.debug("Fetching all currently admitted patients");
        return admissionRepo.findByStatus(AdmissionStatus.ADMITTED)
                .stream().map(this::mapAdmission).toList();
    }

    public AdmissionResponseDTO getAdmissionById(Long id) {
        Admission admission = admissionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));
        return mapAdmission(admission);
    }

    // ─── MAPPERS ─────────────────────────────────────────

    private RoomResponseDTO mapRoom(Room room) {
        long total = bedRepo.countByRoomIdAndActiveTrue(room.getId());
        long available = bedRepo.countByRoomIdAndStatusAndActiveTrue(room.getId(), BedStatus.AVAILABLE);

        return RoomResponseDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .roomType(room.getRoomType())
                .active(room.isActive())
                .departmentId(room.getDepartment().getId())
                .departmentName(room.getDepartment().getName())
                .totalBeds(total)
                .availableBeds(available)
                .build();
    }

    private BedResponseDTO mapBed(Bed bed) {
        return BedResponseDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .bedType(bed.getBedType().name())
                .status(bed.getStatus().name())
                .active(bed.isActive())
                .roomId(bed.getRoom().getId())
                .roomNumber(bed.getRoom().getRoomNumber())
                .floor(bed.getRoom().getFloor())
                .departmentId(bed.getRoom().getDepartment().getId())
                .departmentName(bed.getRoom().getDepartment().getName())
                .build();
    }

    private AdmissionResponseDTO mapAdmission(Admission a) {
        return AdmissionResponseDTO.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName())
                .bedId(a.getBed().getId())
                .bedNumber(a.getBed().getBedNumber())
                .roomNumber(a.getBed().getRoom().getRoomNumber())
                .floor(a.getBed().getRoom().getFloor())
                .departmentName(a.getBed().getRoom().getDepartment().getName())
                .admissionDate(a.getAdmissionDate())
                .dischargeDate(a.getDischargeDate())
                .status(a.getStatus().name())
                .reason(a.getReason())
                .notes(a.getNotes())
                .dischargeSummary(a.getDischargeSummary())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
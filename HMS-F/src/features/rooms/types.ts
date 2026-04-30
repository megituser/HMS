export type BedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface Room {
  id: number;
  roomNumber: string;
  departmentId: number;
  departmentName: string;
  floor: string;
  totalBeds: number;
  availableBeds: number;
  roomType: string;
}

export interface Bed {
  id: number;
  bedNumber: string;
  bedType: string;
  status: BedStatus;
  roomId: number;
}

export interface Admission {
  id: number;
  bedId: number;
  patientName: string;
  doctorName: string;
  status: string;
  admissionDate: string;
  dischargeDate?: string;
  dischargeSummary?: string;
}

export interface AdmissionRequest {
  patientId: number;
  doctorId: number;
  bedId: number;
  admissionDate: string;
  reason?: string;
  notes?: string;
}

export interface DischargeRequest {
  dischargeSummary: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

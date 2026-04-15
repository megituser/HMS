export interface Department {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

export interface DepartmentRequest {
  name: string;
  description?: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  floor: string;
  roomType: string;
  departmentId: number;
  totalBeds: number;
  availableBeds: number;
}

export interface Bed {
  id: number;
  bedNumber: string;
  bedType: string;
  roomId: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';
}

export interface Admission {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  bedId: number;
  bedNumber?: string;
  roomNumber?: string;
  departmentName?: string;
  admissionDate: string;
  dischargeDate?: string;
  reason?: string;
  notes?: string;
  status: 'ADMITTED' | 'DISCHARGED';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

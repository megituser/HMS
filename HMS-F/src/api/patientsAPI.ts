// ─── patientsAPI.ts ───────────────────────────────────────────────────────────
// Returns Spring Page object directly so components can use .content, .totalPages etc.

import api from '../lib/axios';

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  active: boolean;
}

export interface PatientRequest {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const getAllPatients = async (page = 0, size = 10): Promise<PageResponse<Patient>> => {
  const response = await api.get('/patients', { params: { page, size } });
  return response.data;
};

export const getPatientById = async (id: number): Promise<Patient> => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (data: PatientRequest): Promise<Patient> => {
  const response = await api.post('/patients', data);
  return response.data;
};

export const updatePatient = async (id: number, data: PatientRequest): Promise<Patient> => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await api.delete(`/patients/${id}`);
};

export const searchPatients = async (keyword: string): Promise<Patient[]> => {
  const response = await api.get('/patients/search', { params: { keyword } });
  return response.data;
};

export const deactivatePatient = async (id: number): Promise<Patient> => {
  const response = await api.patch(`/patients/${id}/deactivate`);
  return response.data;
};
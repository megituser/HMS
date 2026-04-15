import api from '../lib/axios';

export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  diagnosis: string;
  notes?: string;
  visitDate: string;
  prescription?: string;
}

export interface MedicalRecordRequest {
  patientId: number;
  diagnosis: string;
  notes?: string;
  visitDate: string;
  prescription?: string;
}

/** Fetch all records — ADMIN sees all, DOCTOR sees their own */
export const getAllRecords = async (): Promise<MedicalRecord[]> => {
  const response = await api.get('/medical-records');
  const data = response.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data)) return data;
  return [];
};

/** Fetch only the logged-in doctor's records */
export const getMyRecords = async (): Promise<MedicalRecord[]> => {
  const response = await api.get('/medical-records/my');
  const data = response.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data)) return data;
  return [];
};

export const createRecord = async (data: MedicalRecordRequest): Promise<MedicalRecord> => {
  const response = await api.post('/medical-records', data);
  return response.data;
};

export const deleteRecord = async (id: number): Promise<void> => {
  await api.delete(`/medical-records/${id}`);
};
import api from '../lib/axios'

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'BOOKED';
  notes?: string;
}

export type AppointmentRequest = Omit<Appointment, 'id' | 'patientName' | 'doctorName'>;

export const getAllAppointments = async (page = 0, size = 10, sortBy = 'id'): Promise<PageResponse<Appointment>> => {
  const res = await api.get('/appointments', { params: { page, size, sortBy } })
  return res.data;
}

export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const res = await api.get(`/appointments/${id}`)
  return res.data;
}

export const getAppointmentsByPatient = async (patientId: number): Promise<Appointment[]> => {
  const res = await api.get(`/appointments/patient/${patientId}`)
  return res.data;
}

export const getAppointmentsByDoctor = async (doctorId: number): Promise<Appointment[]> => {
  const res = await api.get(`/appointments/doctor/${doctorId}`)
  return res.data;
}

export const getMyAppointments = async (): Promise<Appointment[]> => {
  const res = await api.get('/appointments/my')
  const data = res.data;
  // Defensively unwrap: backend may return [], { content: [] }, or { data: [] }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export const getAllAppointmentsAdmin = async (): Promise<Appointment[]> => {
  const res = await api.get('/appointments/admin')
  return res.data;
}

export const createAppointment = async (data: AppointmentRequest): Promise<Appointment> => {
  const res = await api.post('/appointments', data)
  return res.data;
}

export const completeAppointment = async (id: number): Promise<Appointment> => {
  const res = await api.put(`/appointments/${id}/complete`)
  return res.data;
}

export const cancelAppointment = async (id: number): Promise<void> => {
  const res = await api.delete(`/appointments/${id}`)
  return res.data;
}

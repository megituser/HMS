import api from '../lib/axios'

export const getAllDoctors = (page=0, size=10, sortBy='id') =>
  api.get('/doctors', { params: { page, size, sortBy } })

export const getDoctorById = (id: number) =>
  api.get(`/doctors/${id}`)

export const getMyProfile = () =>
  api.get('/doctors/me')

export const getDoctorsByDepartment = (departmentId: number) =>
  api.get(`/doctors/department/${departmentId}`)

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  experienceYears?: number;
  phone: string;
  email?: string;
  departmentId: number;
  departmentName?: string;
  userId: number;
  active: boolean;
}

export type DoctorRequest = Omit<Doctor, 'id' | 'active' | 'departmentName'>;

export const createDoctor = (data: DoctorRequest) => 
  api.post('/doctors', data)

export const updateDoctor = (id: number, data: any) =>
  api.put(`/doctors/${id}`, data)

export const deactivateDoctor = (id: number) =>
  api.delete(`/doctors/${id}`)

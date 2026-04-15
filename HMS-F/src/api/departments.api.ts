import api from '../lib/axios';
import type { Department, DepartmentRequest } from '../types/ward.types';

// Returns the data directly so hooks receive the payload, not the axios wrapper
export const getAllDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/departments');
  // Handle Spring Page response: { content: [...] }
  // Handle plain array response: [...]
  const data = response.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data)) return data;
  return [];
};

export const getDepartmentById = async (id: number): Promise<Department> => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (data: DepartmentRequest): Promise<Department> => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: number, data: DepartmentRequest): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deactivateDepartment = async (id: number): Promise<void> => {
  await api.delete(`/departments/${id}`);
};
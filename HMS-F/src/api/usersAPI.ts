import api from '../lib/axios';

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  enabled: boolean;
}

export interface UserRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface UserUpdateRequest {
  email?: string;
  phone?: string;
  role?: string;
  enabled?: boolean;
}

/** Returns Paginated Response from backend */
export const getAllUsers = async (page = 0, size = 10): Promise<any> => {
  const response = await api.get('/users', { params: { page, size } });
  return response.data; // Backend should return Page<User>
};

export const getAvailableDoctorUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/available-doctors');
  return response.data;
};

export const createUser = async (data: UserRequest): Promise<User> => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
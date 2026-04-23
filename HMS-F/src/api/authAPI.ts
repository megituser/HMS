import api from '../lib/axios';

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  role: string;
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

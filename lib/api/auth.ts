import { api } from './axios';
import { AdminLoginRequest, AuthResponse, ChangePasswordRequest, LoginResponse, RefreshRequest } from '@/types/api';

export const authApi = {
  login: (data: AdminLoginRequest) =>
    api.post<LoginResponse>('/admin/auth/login', data).then((r) => r.data),

  refresh: (data: RefreshRequest) =>
    api.post<AuthResponse>('/admin/auth/refresh', data).then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<AuthResponse>('/admin/auth/change-password', data).then((r) => r.data),
};

import { api } from './axios';
import {
  AdminLoginRequest,
  AuthResponse,
  ChangePasswordRequest,
  LoginResponse,
  LogoutRequest,
  RefreshRequest,
  ResetPasswordRequest,
  SendPhoneRequest,
  VerifyPhoneRequest,
  SendEmailRequest,
  VerifyEmailRequest,
} from '@/types/api';

export const authApi = {
  login: (data: AdminLoginRequest) =>
    api.post<LoginResponse>('/admin/auth/login', data).then((r) => r.data),

  logout: (data: LogoutRequest) =>
    api.post('/admin/auth/logout', data).then((r) => r.data),

  refresh: (data: RefreshRequest) =>
    api.post<AuthResponse>('/auth/refresh', data).then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<AuthResponse>('/admin/auth/change-password', data).then((r) => r.data),

  requestPasswordReset: () =>
    api.post<{ message: string }>('/me/password').then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.patch('/me/password', data).then((r) => r.data),

  sendPhone: (data: SendPhoneRequest) =>
    api.post<{ message: string; retryAfterSeconds: number }>('/me/phone', data).then((r) => r.data),

  verifyPhone: (data: VerifyPhoneRequest) =>
    api.patch('/me/phone', data).then((r) => r.data),

  sendEmail: (data: SendEmailRequest) =>
    api.post<{ message: string; retryAfterSeconds: number }>('/me/email', data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailRequest) =>
    api.patch('/me/email', data).then((r) => r.data),
};

import { api } from './axios';
import {
  AdminLoginRequest,
  AuthResponse,
  ChangePasswordRequest,
  LoginResponse,
  RefreshRequest,
  SendPhoneRequest,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  SendEmailRequest,
  VerifyEmailRequest,
} from '@/types/api';

export const authApi = {
  login: (data: AdminLoginRequest) =>
    api.post<LoginResponse>('/admin/auth/login', data).then((r) => r.data),

  refresh: (data: RefreshRequest) =>
    api.post<AuthResponse>('/admin/auth/refresh', data).then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<AuthResponse>('/admin/auth/change-password', data).then((r) => r.data),

  sendPhone: (data: SendPhoneRequest) =>
    api.post('/auth/phone', data).then((r) => r.data),

  verifyPhone: (data: VerifyPhoneRequest) =>
    api.post<VerifyPhoneResponse>('/auth/phone/verify', data).then((r) => r.data),

  sendEmail: (data: SendEmailRequest) =>
    api.post('/auth/email', data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailRequest) =>
    api.post<AuthResponse>('/auth/email/verify', data).then((r) => r.data),
};

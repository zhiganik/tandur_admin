import { api } from './axios';
import { MeDto, UpdateProfileRequest } from '@/types/api';

export const meApi = {
  get: () => api.get<MeDto>('/me').then((r) => r.data),
  update: (data: UpdateProfileRequest) => api.patch<MeDto>('/me', data).then((r) => r.data),
};

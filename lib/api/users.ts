import { api } from './axios';
import { User } from '@/types/api';

export const usersApi = {
  getAll: () => api.get<User[]>('/admin/users').then((r) => r.data),
  delete: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
};

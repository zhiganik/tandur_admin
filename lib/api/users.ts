import { api } from './axios';
import { User, PagedResult } from '@/types/api';

export const usersApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<PagedResult<User>>('/admin/users', { params: { Page: page, Limit: limit } }).then((r) => r.data),
  delete: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
};

import { api } from './axios';
import { User, PagedResult } from '@/types/api';

export const usersApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<PagedResult<User>>('/admin/users', { params: { Page: page, Limit: limit } }).then((r) => r.data),
  getById: (id: string) =>
    api.get<User>(`/admin/users/${id}`).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data),
  assignRestaurant: (adminId: string, restaurantId: string) =>
    api.post(`/admin/users/${adminId}/restaurants/${restaurantId}`).then((r) => r.data),
  unassignRestaurant: (adminId: string, restaurantId: string) =>
    api.delete(`/admin/users/${adminId}/restaurants/${restaurantId}`).then((r) => r.data),
  resetPassword: (id: string) =>
    api.post<{ message: string }>(`/admin/users/${id}/password/reset`).then((r) => r.data),
};

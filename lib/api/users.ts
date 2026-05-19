import { api } from './axios';
import { User, PagedResult } from '@/types/api';

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string[];
  restaurantId?: string;
  sort?: 'asc' | 'desc';
}

export const usersApi = {
  getAll: ({ page = 1, limit = 20, search, role, restaurantId, sort }: UsersParams = {}) => {
    const params: Record<string, unknown> = { Page: page, Limit: limit };
    if (search) params.search = search;
    if (role?.length) params.role = role;
    if (restaurantId) params.restaurantId = restaurantId;
    if (sort) params.sort = sort;
    return api.get<PagedResult<User>>('/admin/users', { params }).then((r) => r.data);
  },
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

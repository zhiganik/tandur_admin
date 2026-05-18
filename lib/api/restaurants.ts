import { api } from './axios';
import { Restaurant, PagedResult, CreateRestaurantRequest, UpdateRestaurantRequest, PatchRestaurantRequest } from '@/types/api';

export const restaurantsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<PagedResult<Restaurant>>('/admin/restaurants', { params: { Page: page, Limit: limit } }).then((r) => r.data),
  getById: (id: string) => api.get<Restaurant>(`/admin/restaurants/${id}`).then((r) => r.data),
  create: (data: CreateRestaurantRequest) => api.post<Restaurant>('/admin/restaurants', data).then((r) => r.data),
  update: (id: string, data: UpdateRestaurantRequest) => api.put<Restaurant>(`/admin/restaurants/${id}`, data).then((r) => r.data),
  patch: (id: string, data: PatchRestaurantRequest) => api.patch<Restaurant>(`/admin/restaurants/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/admin/restaurants/${id}`).then((r) => r.data),
};

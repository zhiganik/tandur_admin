import { api } from './axios';
import { Restaurant, CreateRestaurantRequest, UpdateRestaurantRequest, PatchRestaurantRequest } from '@/types/api';

export const restaurantsApi = {
  getAll: () => api.get<Restaurant[]>('/admin/restaurants').then((r) => r.data),
  getById: (id: string) => api.get<Restaurant>(`/admin/restaurants/${id}`).then((r) => r.data),
  create: (data: CreateRestaurantRequest) => api.post<Restaurant>('/admin/restaurants', data).then((r) => r.data),
  update: (id: string, data: UpdateRestaurantRequest) => api.put<Restaurant>(`/admin/restaurants/${id}`, data).then((r) => r.data),
  patch: (id: string, data: PatchRestaurantRequest) => api.patch<Restaurant>(`/admin/restaurants/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/admin/restaurants/${id}`).then((r) => r.data),
};

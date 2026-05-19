import { api } from './axios';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, PatchCategoryRequest } from '@/types/api';

export const categoriesApi = {
  getAll: (restaurantId: string) =>
    api.get<Category[]>(`/admin/restaurants/${restaurantId}/categories`).then((r) => r.data),

  create: (restaurantId: string, data: CreateCategoryRequest) =>
    api.post<Category>(`/admin/restaurants/${restaurantId}/categories`, data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryRequest) =>
    api.put<Category>(`/admin/categories/${id}`, data).then((r) => r.data),

  patch: (id: string, data: PatchCategoryRequest) =>
    api.patch<Category>(`/admin/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/admin/categories/${id}`).then((r) => r.data),
};

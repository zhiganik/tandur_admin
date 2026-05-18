import { api } from './axios';
import { MenuItem, MenuDto, CreateMenuItemRequest, UpdateMenuItemRequest, PatchMenuItemRequest } from '@/types/api';

export const menuApi = {
  getAll: (restaurantId: string, page = 1, limit = 20) =>
    api.get<MenuDto>(`/admin/restaurants/${restaurantId}/menu`, { params: { Page: page, Limit: limit } }).then((r) => r.data.items),

  create: (data: CreateMenuItemRequest) =>
    api.post<MenuItem>('/admin/menu/items', data).then((r) => r.data),

  update: (id: string, data: UpdateMenuItemRequest) =>
    api.put<MenuItem>(`/admin/menu/items/${id}`, data).then((r) => r.data),

  patch: (id: string, data: PatchMenuItemRequest) =>
    api.patch<MenuItem>(`/admin/menu/items/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/admin/menu/items/${id}`).then((r) => r.data),
};

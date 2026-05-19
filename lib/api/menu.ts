import { api } from './axios';
import { MenuItem, MenuDto, CreateMenuItemRequest, UpdateMenuItemRequest, PatchMenuItemRequest } from '@/types/api';

export const menuApi = {
  getFullMenu: (restaurantId: string) =>
    api.get<MenuDto>(`/admin/restaurants/${restaurantId}/menu`).then((r) => r.data),

  create: (data: CreateMenuItemRequest) =>
    api.post<MenuItem>('/admin/menu/items', data).then((r) => r.data),

  update: (id: string, data: UpdateMenuItemRequest) =>
    api.put<MenuItem>(`/admin/menu/items/${id}`, data).then((r) => r.data),

  patch: (id: string, data: PatchMenuItemRequest) =>
    api.patch<MenuItem>(`/admin/menu/items/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/admin/menu/items/${id}`).then((r) => r.data),
};

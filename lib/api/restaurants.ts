import { api } from './axios';
import {
  Restaurant, CreateRestaurantRequest, UpdateRestaurantRequest, PatchRestaurantRequest,
  ScheduleDay, UpdateScheduleDayRequest, UpdateFullScheduleRequest,
  ScheduleOverride, CreateOverrideRequest, UpdateOverrideRequest, InstantCloseRequest,
} from '@/types/api';

export const restaurantsApi = {
  getAll: () =>
    api.get<Restaurant[]>('/admin/restaurants').then((r) => r.data),
  getById: (id: string) => api.get<Restaurant>(`/admin/restaurants/${id}`).then((r) => r.data),
  create: (data: CreateRestaurantRequest) => api.post<Restaurant>('/admin/restaurants', data).then((r) => r.data),
  update: (id: string, data: UpdateRestaurantRequest) => api.put<Restaurant>(`/admin/restaurants/${id}`, data).then((r) => r.data),
  patch: (id: string, data: PatchRestaurantRequest) => api.patch<Restaurant>(`/admin/restaurants/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/admin/restaurants/${id}`).then((r) => r.data),

  // Schedule
  getSchedule: (id: string) =>
    api.get<ScheduleDay[]>(`/admin/restaurants/${id}/schedule`).then((r) => r.data),
  updateSchedule: (id: string, data: UpdateFullScheduleRequest) =>
    api.put<ScheduleDay[]>(`/admin/restaurants/${id}/schedule`, data).then((r) => r.data),
  updateScheduleDay: (id: string, dayOfWeek: number, data: UpdateScheduleDayRequest) =>
    api.patch<ScheduleDay>(`/admin/restaurants/${id}/schedule/${dayOfWeek}`, data).then((r) => r.data),

  // Overrides
  getOverrides: (id: string) =>
    api.get<ScheduleOverride[]>(`/admin/restaurants/${id}/overrides`).then((r) => r.data),
  createOverride: (id: string, data: CreateOverrideRequest) =>
    api.post<ScheduleOverride>(`/admin/restaurants/${id}/overrides`, data).then((r) => r.data),
  updateOverride: (id: string, overrideId: string, data: UpdateOverrideRequest) =>
    api.put<ScheduleOverride>(`/admin/restaurants/${id}/overrides/${overrideId}`, data).then((r) => r.data),
  deleteOverride: (id: string, overrideId: string) =>
    api.delete(`/admin/restaurants/${id}/overrides/${overrideId}`).then((r) => r.data),

  // Instant close
  instantClose: (id: string, data: InstantCloseRequest) =>
    api.post<ScheduleOverride>(`/admin/restaurants/${id}/close`, data).then((r) => r.data),
  removeInstantClose: (id: string) =>
    api.delete(`/admin/restaurants/${id}/close`).then((r) => r.data),
};

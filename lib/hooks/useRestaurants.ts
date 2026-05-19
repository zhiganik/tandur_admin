import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantsApi } from '@/lib/api/restaurants';
import {
  CreateRestaurantRequest, UpdateRestaurantRequest,
  UpdateScheduleDayRequest, UpdateFullScheduleRequest,
  CreateOverrideRequest, UpdateOverrideRequest, InstantCloseRequest,
} from '@/types/api';

export const useRestaurants = () =>
  useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantsApi.getAll(),
  });

export const useAllRestaurants = useRestaurants;

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRestaurantRequest) => restaurantsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantRequest }) =>
      restaurantsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });
};

export const usePatchRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      restaurantsApi.patch(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });
};

// Schedule
export const useRestaurantSchedule = (id: string | null) =>
  useQuery({
    queryKey: ['restaurant-schedule', id],
    queryFn: () => restaurantsApi.getSchedule(id!),
    enabled: !!id,
  });

export const useUpdateScheduleDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dayOfWeek, data }: { id: string; dayOfWeek: number; data: UpdateScheduleDayRequest }) =>
      restaurantsApi.updateScheduleDay(id, dayOfWeek, data),
    onSuccess: (_res, { id }) => queryClient.invalidateQueries({ queryKey: ['restaurant-schedule', id] }),
  });
};

export const useUpdateFullSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFullScheduleRequest }) =>
      restaurantsApi.updateSchedule(id, data),
    onSuccess: (_res, { id }) => queryClient.invalidateQueries({ queryKey: ['restaurant-schedule', id] }),
  });
};

// Overrides
export const useRestaurantOverrides = (id: string | null) =>
  useQuery({
    queryKey: ['restaurant-overrides', id],
    queryFn: () => restaurantsApi.getOverrides(id!),
    enabled: !!id,
  });

export const useCreateOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateOverrideRequest }) =>
      restaurantsApi.createOverride(id, data),
    onSuccess: (_res, { id }) => queryClient.invalidateQueries({ queryKey: ['restaurant-overrides', id] }),
  });
};

export const useUpdateOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, overrideId, data }: { id: string; overrideId: string; data: UpdateOverrideRequest }) =>
      restaurantsApi.updateOverride(id, overrideId, data),
    onSuccess: (_res, { id }) => queryClient.invalidateQueries({ queryKey: ['restaurant-overrides', id] }),
  });
};

export const useDeleteOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, overrideId }: { id: string; overrideId: string }) =>
      restaurantsApi.deleteOverride(id, overrideId),
    onSuccess: (_res, { id }) => queryClient.invalidateQueries({ queryKey: ['restaurant-overrides', id] }),
  });
};

export const useInstantClose = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InstantCloseRequest }) =>
      restaurantsApi.instantClose(id, data),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-overrides', id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useRemoveInstantClose = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restaurantsApi.removeInstantClose(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-overrides', id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

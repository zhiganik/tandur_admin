import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantsApi } from '@/lib/api/restaurants';
import { CreateRestaurantRequest, UpdateRestaurantRequest } from '@/types/api';

export const useRestaurants = (page = 1, limit = 20) =>
  useQuery({
    queryKey: ['restaurants', page, limit],
    queryFn: () => restaurantsApi.getAll(page, limit),
  });

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

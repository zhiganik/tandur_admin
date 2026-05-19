import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menu';
import { CreateMenuItemRequest, UpdateMenuItemRequest, PatchMenuItemRequest } from '@/types/api';

export const useCreateMenuItem = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemRequest) => menuApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['full-menu', restaurantId] }),
  });
};

export const useUpdateMenuItem = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemRequest }) =>
      menuApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['full-menu', restaurantId] }),
  });
};

export const usePatchMenuItem = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchMenuItemRequest }) =>
      menuApi.patch(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['full-menu', restaurantId] }),
  });
};

export const useDeleteMenuItem = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['full-menu', restaurantId] }),
  });
};

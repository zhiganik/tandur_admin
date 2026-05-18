import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { CreateCategoryRequest, UpdateCategoryRequest, PatchCategoryRequest } from '@/types/api';

export const useCategories = (restaurantId: string, page = 1, limit = 20) =>
  useQuery({
    queryKey: ['categories', restaurantId, page, limit],
    queryFn: () => categoriesApi.getAll(restaurantId, page, limit),
    enabled: !!restaurantId,
  });

export const useCreateCategory = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] }),
  });
};

export const useUpdateCategory = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] }),
  });
};

export const usePatchCategory = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchCategoryRequest }) =>
      categoriesApi.patch(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] }),
  });
};

export const useDeleteCategory = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] }),
  });
};

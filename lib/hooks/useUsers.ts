import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';

export const useUsers = (page = 1, limit = 20) =>
  useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersApi.getAll(page, limit),
  });

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useAssignRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, restaurantId }: { adminId: string; restaurantId: string }) =>
      usersApi.assignRestaurant(adminId, restaurantId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUnassignRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, restaurantId }: { adminId: string; restaurantId: string }) =>
      usersApi.unassignRestaurant(adminId, restaurantId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useResetAdminPassword = () =>
  useMutation({
    mutationFn: usersApi.resetPassword,
  });

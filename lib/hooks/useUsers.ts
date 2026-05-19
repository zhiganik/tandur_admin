import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UsersParams } from '@/lib/api/users';

export const useUsers = (params: UsersParams = {}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
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

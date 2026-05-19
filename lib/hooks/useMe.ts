import { useQuery, useQueryClient } from '@tanstack/react-query';
import { meApi } from '@/lib/api/me';

export const ME_KEY = ['me'] as const;

export const useMe = () =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: meApi.get,
    staleTime: 5 * 60 * 1000,
  });

export const useInvalidateMe = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ME_KEY });
};

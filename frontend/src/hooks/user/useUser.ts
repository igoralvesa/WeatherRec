import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types/api';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async (): Promise<User> => {
      return api.get<User>(`/users/${userId}`);
    },
    enabled: !!userId,
  });
}


import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { User } from '@/types/api';

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User> => {
      const user = await api.get<User>('/auth/me');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return user;
    },
    enabled: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


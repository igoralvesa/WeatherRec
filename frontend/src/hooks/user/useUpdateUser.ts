import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { User, UpdateUserDto } from '@/types/api';

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserDto): Promise<User> => {
      const updatedUser = await api.patch<User>(`/users/${userId}`, data);
      
      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      return updatedUser;
    },
  });
}


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.delete(`/users/${userId}`);
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Clear all queries
      queryClient.clear();
    },
  });
}


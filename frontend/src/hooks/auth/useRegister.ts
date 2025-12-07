import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RegisterDto, User } from '@/types/api';

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterDto): Promise<User> => {
      return api.post<User>('/auth/register', data);
    },
  });
}


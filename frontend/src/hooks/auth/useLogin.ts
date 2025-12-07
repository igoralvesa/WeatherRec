import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { LoginDto, AuthResponse, User } from '@/types/api';

interface LoginResponse extends AuthResponse {
  user: User;
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginDto): Promise<LoginResponse> => {
      const authResponse = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Store token first
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.access_token);
      
      // Fetch user data (token is now in localStorage, so api client will include it)
      const user = await api.get<User>('/auth/me');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Invalidate and refetch user queries
      queryClient.setQueryData(['auth', 'me'], user);
      
      return {
        ...authResponse,
        user,
      };
    },
  });
}


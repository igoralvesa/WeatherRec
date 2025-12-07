import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogin } from '@/hooks/auth/useLogin';
import { useRegister } from '@/hooks/auth/useRegister';
import { useMe } from '@/hooks/auth/useMe';
import { STORAGE_KEYS } from '@/lib/constants';
import { setUnauthorizedHandler } from '@/lib/api';
import type { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, cep: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync user from useMe hook
  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
  }, [meData]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-throw to allow pages to handle specific error messages
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, cep: string): Promise<boolean> => {
    try {
      const newUser = await registerMutation.mutateAsync({ name, email, password, cep });
      // After registration, user needs to login
      return !!newUser;
    } catch (error: any) {
      console.error('Register error:', error);
      // Re-throw to allow pages to handle specific error messages
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    queryClient.clear();
  };

  // Set up unauthorized handler for API client
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, []);

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  const isLoading = isLoadingMe || loginMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      login,
      register,
      logout,
      updateProfile,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

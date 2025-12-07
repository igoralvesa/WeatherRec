// Get API URL from runtime config (Docker) or build-time env var (dev)
const getApiUrl = (): string => {
  // Check for runtime config (set by Docker entrypoint)
  if (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL) {
    return (window as any).__ENV__.VITE_API_URL;
  }
  // Fallback to build-time env var or default
  // Use import.meta.env for Vite environment variables
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

export const API_URL = getApiUrl();

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;


import { API_URL, STORAGE_KEYS } from './constants';
import type { ApiError } from '@/types/api';

// Callback para quando ocorrer erro 401
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private handleUnauthorized() {
    // Clear auth data
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Call handler if set
    if (onUnauthorized) {
      onUnauthorized();
    } else {
      // Fallback: redirect to login if handler not set
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses (e.g., file downloads)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          // Handle 401 Unauthorized - token expired or invalid
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          
          const error: ApiError = {
            message: data.message || 'An error occurred',
            statusCode: response.status,
            error: data.error,
          };
          throw error;
        }

        return data as T;
      } else {
        // For non-JSON responses (like file downloads), return blob or text
        if (!response.ok) {
          // Handle 401 Unauthorized - token expired or invalid
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          
          const error: ApiError = {
            message: 'An error occurred',
            statusCode: response.status,
          };
          throw error;
        }
        return response as unknown as T;
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        // Re-throw API errors (including 401)
        throw error;
      }
      // Network errors
      throw {
        message: 'Erro de conexão. Verifique sua internet e se o servidor está disponível.',
        statusCode: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Special method for file downloads
  async downloadFile(
    endpoint: string,
    filename: string
  ): Promise<void> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.handleUnauthorized();
      }
      
      throw {
        message: 'Falha ao baixar arquivo',
        statusCode: response.status,
      } as ApiError;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const api = new ApiClient(API_URL);


import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherInsights } from '@/types/api';

export function useWeatherInsights() {
  return useQuery({
    queryKey: ['weather', 'insights'],
    queryFn: async (): Promise<WeatherInsights> => {
      return api.get<WeatherInsights>('/weather/insights');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}


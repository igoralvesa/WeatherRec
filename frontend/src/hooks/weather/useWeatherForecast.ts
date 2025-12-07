import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherForecast } from '@/types/api';

export function useWeatherForecast() {
  return useQuery({
    queryKey: ['weather', 'forecast'],
    queryFn: async (): Promise<WeatherForecast> => {
      return api.get<WeatherForecast>('/weather/forecast');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}


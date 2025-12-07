import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherLog } from '@/types/api';

export function useWeatherLast() {
  return useQuery({
    queryKey: ['weather', 'last'],
    queryFn: async (): Promise<WeatherLog> => {
      return api.get<WeatherLog>('/weather/last');
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}


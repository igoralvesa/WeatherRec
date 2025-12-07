import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherLogsResponse, QueryWeatherLogsParams } from '@/types/api';

export function useWeatherLogs(params: QueryWeatherLogsParams = {}) {
  return useQuery({
    queryKey: ['weather', 'logs', params],
    queryFn: async (): Promise<WeatherLogsResponse> => {
      const searchParams = new URLSearchParams();
      
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      
      const queryString = searchParams.toString();
      const url = `/weather/logs${queryString ? `?${queryString}` : ''}`;
      
      return api.get<WeatherLogsResponse>(url);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}


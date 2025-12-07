import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherSummary } from '@/types/api';

interface UseWeatherSummaryParams {
  from?: string;
  to?: string;
}

export function useWeatherSummary(params: UseWeatherSummaryParams = {}) {
  return useQuery({
    queryKey: ['weather', 'summary', params],
    queryFn: async (): Promise<WeatherSummary> => {
      const searchParams = new URLSearchParams();
      
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      
      const queryString = searchParams.toString();
      const url = `/weather/summary${queryString ? `?${queryString}` : ''}`;
      
      return api.get<WeatherSummary>(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


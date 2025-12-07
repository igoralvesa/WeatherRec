import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherTimeseries } from '@/types/api';

interface UseWeatherTimeseriesParams {
  from?: string;
  to?: string;
}

export function useWeatherTimeseries(params: UseWeatherTimeseriesParams = {}) {
  return useQuery({
    queryKey: ['weather', 'timeseries', params],
    queryFn: async (): Promise<WeatherTimeseries> => {
      const searchParams = new URLSearchParams();
      
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      
      const queryString = searchParams.toString();
      const url = `/weather/timeseries${queryString ? `?${queryString}` : ''}`;
      
      return api.get<WeatherTimeseries>(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


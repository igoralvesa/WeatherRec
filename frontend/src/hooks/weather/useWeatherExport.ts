import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface UseWeatherExportParams {
  format: 'csv' | 'xlsx';
  from?: string;
  to?: string;
}

export function useWeatherExport() {
  return useMutation({
    mutationFn: async (params: UseWeatherExportParams): Promise<void> => {
      const searchParams = new URLSearchParams();
      searchParams.append('format', params.format);
      
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      
      const url = `/weather/export?${searchParams.toString()}`;
      const filename = `weather-data-${new Date().toISOString().split('T')[0]}.${params.format}`;
      
      await api.downloadFile(url, filename);
    },
  });
}


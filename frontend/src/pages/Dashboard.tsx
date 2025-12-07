import { useMemo, useState } from 'react';
import { Thermometer, Droplets, Wind, Activity, Download, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { StatCard } from '@/components/weather/StatCard';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { WeatherChart } from '@/components/weather/WeatherChart';
import { RecentLogsTable } from '@/components/weather/RecentLogsTable';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeatherLast } from '@/hooks/weather/useWeatherLast';
import { useWeatherSummary } from '@/hooks/weather/useWeatherSummary';
import { useWeatherTimeseries } from '@/hooks/weather/useWeatherTimeseries';
import { useWeatherForecast } from '@/hooks/weather/useWeatherForecast';
import { useWeatherLogs } from '@/hooks/weather/useWeatherLogs';
import { useWeatherExport } from '@/hooks/weather/useWeatherExport';
import { useWeatherInsights } from '@/hooks/weather/useWeatherInsights';
import { InsightBanner } from '@/components/weather/InsightBanner';
import { toast } from '@/hooks/use-toast';
import type { WeatherCondition } from '@/components/weather/WeatherIcon';

// Helper function to map API condition to WeatherCondition type
// Mapeia os valores vindos do collector para os tipos WeatherCondition
function mapCondition(condition: string): WeatherCondition {
  // Valores válidos do WEATHER_CODE_MAP do collector
  const validConditions: WeatherCondition[] = [
    'clear',
    'partly_cloudy',
    'cloudy',
    'smoky',
    'haze',
    'foggy',
    'drizzle',
    'freezing_drizzle',
    'rain',
    'freezing_rain',
    'rain_and_drizzle',
    'snow',
    'snow_grains',
    'rain_shower',
    'snow_rain_shower',
    'snow_shower',
    'snow_grains_shower',
    'thunderstorm',
  ];
  
  // Se o valor já é um tipo válido, retorna diretamente
  if (validConditions.includes(condition as WeatherCondition)) {
    return condition as WeatherCondition;
  }
  
  // Fallback para valores desconhecidos ou inválidos
  return 'cloudy';
}

// Helper function to format timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const { data: lastWeather, isLoading: isLoadingLast, error: errorLast } = useWeatherLast();
  const { data: summary, isLoading: isLoadingSummary } = useWeatherSummary();
  const { data: timeseries, isLoading: isLoadingTimeseries } = useWeatherTimeseries();
  const { data: forecast, isLoading: isLoadingForecast } = useWeatherForecast();
  const { data: logsData, isLoading: isLoadingLogs } = useWeatherLogs({ page: 1, limit: 5 });
  const exportMutation = useWeatherExport();
  const { data: insightsData } = useWeatherInsights();
  
  // Estado para controlar quais insights foram fechados (usando chave única: tipo + mensagem)
  const [closedInsights, setClosedInsights] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => {
    if (!timeseries?.points) return [];
    return timeseries.points.map((point) => ({
      time: formatTimestamp(point.timestamp),
      temperature: Math.round(point.temperature * 10) / 10,
      humidity: point.humidity,
    }));
  }, [timeseries]);

  const forecastChartData = useMemo(() => {
    if (!forecast?.hourly || forecast.hourly.length === 0) return [];
    // Limitar às próximas 24 horas
    const next24Hours = forecast.hourly.slice(0, 24);
    return next24Hours.map((hour) => ({
      time: formatTimestamp(hour.timestamp),
      temperature: Math.round(hour.temperature * 10) / 10,
      precipitationProbability: Math.round(hour.precipitation_probability * 100),
    }));
  }, [forecast]);

  const recentLogs = useMemo(() => {
    if (!logsData?.data) return [];
    return logsData.data.map((log) => ({
      id: log.timestamp,
      timestamp: formatTimestamp(log.timestamp),
      temperature: Math.round(log.temperature),
      humidity: log.humidity,
      condition: mapCondition(log.condition),
    }));
  }, [logsData]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await exportMutation.mutateAsync({ format });
      toast({
        title: 'Exportação iniciada',
        description: `Os dados estão sendo exportados em formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isLoadingLast || isLoadingSummary || isLoadingTimeseries || isLoadingForecast || isLoadingLogs;
  const hasError = errorLast;

  if (hasError && !lastWeather) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Dashboard" subtitle="Erro ao carregar dados" />
        <div className="flex-1 overflow-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar os dados do clima. Verifique sua conexão e tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const lastUpdate = lastWeather 
    ? new Date(lastWeather.timestamp).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR');

  // Filtrar insights visíveis (não fechados)
  const visibleInsights = useMemo(() => {
    if (!insightsData?.alerts) return [];
    return insightsData.alerts.filter((alert) => {
      const key = `${alert.type}-${alert.message}`;
      return !closedInsights.has(key);
    });
  }, [insightsData, closedInsights]);

  const handleCloseInsight = (type: string, message: string) => {
    const key = `${type}-${message}`;
    setClosedInsights((prev) => new Set(prev).add(key));
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Dashboard" 
        subtitle={`Última atualização: ${lastUpdate}`}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Weather Insights */}
          {visibleInsights.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              {visibleInsights.map((alert) => {
                const key = `${alert.type}-${alert.message}`;
                return (
                  <InsightBanner
                    key={key}
                    type={alert.type}
                    message={alert.message}
                    onClose={() => handleCloseInsight(alert.type, alert.message)}
                  />
                );
              })}
            </div>
          )}

          {/* Top Row - Current Weather & Summary Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoadingLast ? (
              <Skeleton className="h-[200px] lg:col-span-1" />
            ) : lastWeather ? (
              <CurrentWeatherCard
                temperature={Math.round(lastWeather.temperature)}
                feelsLike={Math.round(lastWeather.feels_like)}
                humidity={lastWeather.humidity}
                windSpeed={Math.round(lastWeather.wind_speed)}
                condition={mapCondition(lastWeather.condition)}
                lastUpdate={formatTimestamp(lastWeather.timestamp)}
                className="lg:col-span-1 animate-slide-up"
              />
            ) : null}

            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoadingSummary ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[120px]" />
                ))
              ) : summary ? (
                <>
                  <StatCard
                    title="Média 24h"
                    value={`${Math.round(summary.temperature.avg)}°C`}
                    icon={Thermometer}
                    iconColor="text-weather-sun"
                    className="animate-slide-up stagger-1"
                  />
                  <StatCard
                    title="Mín / Máx"
                    value={`${Math.round(summary.temperature.min)}° / ${Math.round(summary.temperature.max)}°`}
                    icon={Thermometer}
                    iconColor="text-primary"
                    className="animate-slide-up stagger-2"
                  />
                  <StatCard
                    title="Umidade Média"
                    value={`${Math.round(summary.humidity.avg)}%`}
                    icon={Droplets}
                    iconColor="text-weather-rain"
                    className="animate-slide-up stagger-3"
                  />
                  <StatCard
                    title="Vento Médio"
                    value={`${Math.round(summary.wind_speed.avg)} km/h`}
                    icon={Wind}
                    iconColor="text-weather-wind"
                    className="animate-slide-up stagger-4"
                  />
                </>
              ) : null}
            </div>
          </div>

          {/* Second Row - Forecast Chart */}
          <div className="animate-slide-up stagger-2">
            {isLoadingForecast ? (
              <Skeleton className="h-[300px]" />
            ) : forecastChartData.length > 0 ? (
              <ForecastCard
                data={forecastChartData}
                className="animate-slide-up stagger-2"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado de previsão disponível
              </div>
            )}
          </div>

          {/* Third Row - Timeseries Chart */}
          <div className="animate-slide-up stagger-3">
            {isLoadingTimeseries ? (
              <Skeleton className="h-[300px]" />
            ) : chartData.length > 0 ? (
              <WeatherChart
                data={chartData}
                className="animate-slide-up stagger-3"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado disponível para o gráfico
              </div>
            )}
          </div>

          {/* Fourth Row - Recent Logs */}
          <div className="animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Histórico de Leituras</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={exportMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('xlsx')}
                  disabled={exportMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  XLSX
                </Button>
              </div>
            </div>

            {isLoadingLogs ? (
              <Skeleton className="h-[300px]" />
            ) : recentLogs.length > 0 ? (
              <RecentLogsTable logs={recentLogs} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log disponível
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

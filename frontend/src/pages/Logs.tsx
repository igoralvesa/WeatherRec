import { useState, useMemo } from 'react';
import { Calendar, Filter, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { WeatherIcon, type WeatherCondition } from '@/components/weather/WeatherIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWeatherLogs } from '@/hooks/weather/useWeatherLogs';
import { useWeatherExport } from '@/hooks/weather/useWeatherExport';
import { toast } from '@/hooks/use-toast';

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

// Helper function to format condition name for display in Portuguese
function formatConditionName(condition: WeatherCondition): string {
  const conditionNames: Record<WeatherCondition, string> = {
    'clear': 'Céu limpo',
    'partly_cloudy': 'Parcialmente nublado',
    'cloudy': 'Nublado',
    'smoky': 'Enfumaçado',
    'haze': 'Neblina',
    'foggy': 'Nebuloso',
    'drizzle': 'Garoa',
    'freezing_drizzle': 'Garoa congelante',
    'rain': 'Chuva',
    'freezing_rain': 'Chuva congelante',
    'rain_and_drizzle': 'Chuva e garoa',
    'snow': 'Neve',
    'snow_grains': 'Grãos de neve',
    'rain_shower': 'Chuva forte',
    'snow_rain_shower': 'Chuva e neve',
    'snow_shower': 'Neve forte',
    'snow_grains_shower': 'Granizo',
    'thunderstorm': 'Tempestade',
  };
  
  return conditionNames[condition] || condition;
}

// Helper function to format date for API (ISO 8601)
function formatDateForAPI(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString();
}

// Helper function to format date for input (YYYY-MM-DD)
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function Logs() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build query params
  const queryParams = useMemo(() => {
    const params: { page?: number; limit?: number; from?: string; to?: string } = {
      page: currentPage,
      limit: itemsPerPage,
    };
    
    if (dateFrom) {
      params.from = formatDateForAPI(dateFrom);
    }
    if (dateTo) {
      params.to = formatDateForAPI(dateTo);
    }
    
    return params;
  }, [currentPage, dateFrom, dateTo]);

  const { data: logsData, isLoading, error } = useWeatherLogs(queryParams);
  const exportMutation = useWeatherExport();

  const logs = useMemo(() => {
    if (!logsData?.data) return [];
    return logsData.data.map((log) => ({
      id: log.timestamp,
      timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
      temperature: Math.round(log.temperature),
      humidity: log.humidity,
      windSpeed: Math.round(log.wind_speed),
      condition: mapCondition(log.condition),
      rainProbability: Math.round(log.rain_probability * 100),
    }));
  }, [logsData]);

  const totalPages = logsData ? Math.ceil(logsData.total / itemsPerPage) : 1;

  const handleFilter = () => {
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await exportMutation.mutateAsync({
        format,
        from: dateFrom ? formatDateForAPI(dateFrom) : undefined,
        to: dateTo ? formatDateForAPI(dateTo) : undefined,
      });
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

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Logs" subtitle="Erro ao carregar dados" />
        <div className="flex-1 overflow-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar os logs. Verifique sua conexão e tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Logs" subtitle="Histórico completo de leituras" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters */}
          <Card className="glass-card animate-slide-up">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label htmlFor="dateFrom">Data Início</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-10"
                      max={dateTo || formatDateForInput(new Date())}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label htmlFor="dateTo">Data Fim</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-10"
                      min={dateFrom}
                      max={formatDateForInput(new Date())}
                    />
                  </div>
                </div>

                <Button onClick={handleFilter} className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={exportMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExport('xlsx')}
                  disabled={exportMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  XLSX
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="glass-card overflow-hidden animate-slide-up stagger-1">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Temperatura</TableHead>
                      <TableHead>Umidade</TableHead>
                      <TableHead>Vento</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Prob. Chuva</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum log encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-secondary/20">
                          <TableCell className="font-medium">{log.timestamp}</TableCell>
                          <TableCell>{log.temperature}°C</TableCell>
                          <TableCell>{log.humidity}%</TableCell>
                          <TableCell>{log.windSpeed} km/h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <WeatherIcon condition={log.condition} size="sm" />
                              <span className="text-muted-foreground">
                                {formatConditionName(log.condition)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{log.rainProbability}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {logsData && logsData.total > 0 && (
                  <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                      {Math.min(currentPage * itemsPerPage, logsData.total)} de{' '}
                      {logsData.total} registros
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isLoading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={isLoading}
                              className="w-8 h-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || isLoading || !logsData.has_next}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

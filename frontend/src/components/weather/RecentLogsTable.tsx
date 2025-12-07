import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WeatherIcon, type WeatherCondition } from './WeatherIcon';
import { cn } from '@/lib/utils';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

interface LogEntry {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  condition: WeatherCondition;
}

interface RecentLogsTableProps {
  logs: LogEntry[];
  className?: string;
}

export function RecentLogsTable({ logs, className }: RecentLogsTableProps) {
  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 hover:bg-secondary/30">
            <TableHead>Horário</TableHead>
            <TableHead>Temperatura</TableHead>
            <TableHead>Umidade</TableHead>
            <TableHead>Condição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-secondary/20">
              <TableCell className="font-medium">{log.timestamp}</TableCell>
              <TableCell>{log.temperature}°C</TableCell>
              <TableCell>{log.humidity}%</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <WeatherIcon condition={log.condition} size="sm" />
                  <span className="text-muted-foreground">
                    {formatConditionName(log.condition)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CardFooter className="justify-center border-t border-border py-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/logs">
            Ver todos os logs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

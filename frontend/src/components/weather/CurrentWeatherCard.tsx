import { Thermometer, Droplets, Wind } from 'lucide-react';
import { WeatherIcon, type WeatherCondition } from './WeatherIcon';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface CurrentWeatherCardProps {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  lastUpdate: string;
  className?: string;
}

export function CurrentWeatherCard({
  temperature,
  feelsLike,
  humidity,
  windSpeed,
  condition,
  lastUpdate,
  className,
}: CurrentWeatherCardProps) {
  return (
    <Card className={cn(
      "weather-gradient text-primary-foreground relative overflow-hidden border-0",
      className
    )}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80 mb-1">
              Última Leitura
            </p>
            <p className="text-5xl font-bold tracking-tight">
              {temperature}°C
            </p>
          </div>
          <WeatherIcon condition={condition} size="xl" className="text-primary-foreground/90" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-primary-foreground/70" />
            <div>
              <p className="text-xs text-primary-foreground/60">S. Térmica</p>
              <p className="text-sm font-medium">{feelsLike}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary-foreground/70" />
            <div>
              <p className="text-xs text-primary-foreground/60">Umidade</p>
              <p className="text-sm font-medium">{humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary-foreground/70" />
            <div>
              <p className="text-xs text-primary-foreground/60">Vento</p>
              <p className="text-sm font-medium">{windSpeed} km/h</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">
          Atualizado em {lastUpdate}
        </p>
      </CardContent>
    </Card>
  );
}

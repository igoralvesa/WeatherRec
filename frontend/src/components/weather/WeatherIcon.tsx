import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudSun,
  Wind,
  Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos de condição climática baseados no WEATHER_CODE_MAP do collector
type WeatherCondition = 
  | 'clear' 
  | 'partly_cloudy' 
  | 'cloudy' 
  | 'smoky'
  | 'haze'
  | 'foggy'
  | 'drizzle'
  | 'freezing_drizzle'
  | 'rain'
  | 'freezing_rain'
  | 'rain_and_drizzle'
  | 'snow'
  | 'snow_grains'
  | 'rain_shower'
  | 'snow_rain_shower'
  | 'snow_shower'
  | 'snow_grains_shower'
  | 'thunderstorm';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconMap: Record<WeatherCondition, React.ElementType> = {
  'clear': Sun,
  'partly_cloudy': CloudSun,
  'cloudy': Cloud,
  'smoky': Cloud,
  'haze': CloudSun,
  'foggy': Cloud,
  'drizzle': CloudDrizzle,
  'freezing_drizzle': CloudDrizzle,
  'rain': CloudRain,
  'freezing_rain': CloudRain,
  'rain_and_drizzle': CloudRain,
  'snow': CloudSnow,
  'snow_grains': CloudSnow,
  'rain_shower': CloudRain,
  'snow_rain_shower': CloudRain,
  'snow_shower': CloudSnow,
  'snow_grains_shower': CloudSnow,
  'thunderstorm': CloudLightning,
};

const colorClasses: Record<WeatherCondition, string> = {
  'clear': 'text-weather-sun',
  'partly_cloudy': 'text-weather-sun',
  'cloudy': 'text-weather-cloud',
  'smoky': 'text-muted-foreground',
  'haze': 'text-muted-foreground',
  'foggy': 'text-muted-foreground',
  'drizzle': 'text-weather-rain',
  'freezing_drizzle': 'text-blue-400',
  'rain': 'text-weather-rain',
  'freezing_rain': 'text-blue-400',
  'rain_and_drizzle': 'text-weather-rain',
  'snow': 'text-blue-200',
  'snow_grains': 'text-blue-200',
  'rain_shower': 'text-weather-rain',
  'snow_rain_shower': 'text-blue-300',
  'snow_shower': 'text-blue-200',
  'snow_grains_shower': 'text-blue-200',
  'thunderstorm': 'text-yellow-500',
};

export function WeatherIcon({ condition, size = 'md', className }: WeatherIconProps) {
  const Icon = iconMap[condition];
  
  return (
    <Icon 
      className={cn(
        sizeClasses[size],
        colorClasses[condition],
        className
      )} 
    />
  );
}

export type { WeatherCondition };

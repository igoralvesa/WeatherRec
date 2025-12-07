// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  cep: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cep: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

// Weather Types
export interface WeatherLog {
  timestamp: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  feels_like: number;
  wind_speed: number;
  condition: string;
  rain_probability: number;
}

export interface WeatherLogsResponse {
  data: WeatherLog[];
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
}

export interface QueryWeatherLogsParams {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface MetricStats {
  min: number;
  max: number;
  avg: number;
}

export interface WeatherSummary {
  location: string;
  from: string;
  to: string;
  temperature: MetricStats;
  humidity: MetricStats;
  wind_speed: MetricStats;
  records_count: number;
}

export interface TimeseriesPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
}

export interface WeatherTimeseries {
  points: TimeseriesPoint[];
}

export interface HourlyForecast {
  timestamp: string;
  temperature: number;
  precipitation_probability: number;
}

export interface WeatherForecast {
  location: string;
  hourly: HourlyForecast[];
}

export interface UpdateUserDto {
  name?: string;
  cep?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export type AlertType = 'info' | 'warning' | 'danger';

export interface Alert {
  type: AlertType;
  message: string;
}

export interface WeatherInsights {
  alerts: Alert[];
  status: 'info' | 'warning';
}


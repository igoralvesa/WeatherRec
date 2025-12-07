import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WeatherForecastResponseDto } from '../dto/weather-forecast-response.dto';

@Injectable()
export class OpenMeteoService {
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly LATITUDE = -8.05;
  private readonly LONGITUDE = -34.9;

  async getForecast(): Promise<WeatherForecastResponseDto> {
    const params = {
      latitude: this.LATITUDE,
      longitude: this.LONGITUDE,
      hourly: 'precipitation_probability,temperature_2m',
      forecast_days: 2, // Pedir 2 dias para garantir que temos dados suficientes
    };

    const response = await axios.get(this.BASE_URL, { params });

    const hourly = response.data.hourly;
    const precipitationProbabilities = hourly.precipitation_probability || [];
    const temperatures = hourly.temperature_2m || [];
    const times = hourly.time || [];

    // Calcular timestamp atual e arredondar para a hora completa atual
    // Exemplo: se são 14:30, vamos pegar a partir de 14:00
    const now = new Date();
    now.setMinutes(0, 0, 0); // Arredondar para a hora completa (minutos e segundos = 0)
    const currentHourTimestamp = now.getTime();

    // Encontrar o primeiro índice que corresponda à hora atual ou seja >= hora atual
    // A API retorna dados horários em formato ISO (ex: "2025-01-15T14:00:00Z")
    let startIndex = 0;
    for (let i = 0; i < times.length; i++) {
      const timestamp = new Date(times[i]).getTime();
      // Se o timestamp da API for >= hora atual completa, esse é nosso ponto de partida
      if (timestamp >= currentHourTimestamp) {
        startIndex = i;
        break;
      }
    }

    // Pegar exatamente 24 horas a partir da hora atual completa
    // Exemplo: se são 14:30, pega de 14:00 até 13:00 do dia seguinte (24 horas)
    const hourlyData = [];
    const endIndex = Math.min(startIndex + 24, times.length);

    for (let i = startIndex; i < endIndex; i++) {
      hourlyData.push({
        timestamp: times[i],
        temperature: temperatures[i] != null ? temperatures[i] : 0,
        precipitation_probability:
          precipitationProbabilities[i] != null ? precipitationProbabilities[i] / 100 : 0, // Converter de 0-100 para 0-1
      });
    }

    return {
      location: 'Recife, Brasil',
      hourly: hourlyData,
    };
  }
}


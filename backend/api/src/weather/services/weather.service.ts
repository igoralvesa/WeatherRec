import { Injectable, NotFoundException } from '@nestjs/common';
import { WeatherRepository } from '../repositories/weather.repository';
import { CreateWeatherLogDto } from '../dto/create-weather-log.dto';
import { WeatherLog } from '../schemas/weather-log.schema';
import { QueryWeatherLogsDto } from '../dto/query-weather-logs.dto';
import { ExportService } from './export.service';
import { AlertDto, AlertType } from '../dto/weather-insights-response.dto';

@Injectable()
export class WeatherService {
  constructor(
    private readonly weatherRepository: WeatherRepository,
    private readonly exportService: ExportService,
  ) {}

  async saveLog(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    return this.weatherRepository.create(createWeatherLogDto);
  }

  async getLast(): Promise<WeatherLog> {
    const last = await this.weatherRepository.findLast();
    if (!last) {
      throw new NotFoundException('Nenhum registro climático encontrado.');
    }
    return last;
  }

  async getLogs(query: QueryWeatherLogsDto) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const page = query.page || 1;
    const limit = query.limit || 50;

    const { data, total } = await this.weatherRepository.findPaginated(
      from,
      to,
      page,
      limit,
    );

    const has_next = page * limit < total;

    return {
      data,
      page,
      limit,
      total,
      has_next,
    };
  }

  async getSummary(from?: string, to?: string) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from && to) {
      fromDate = new Date(from);
      toDate = new Date(to);
    } else {
      // Últimas 24h por padrão
      toDate = new Date();
      fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const stats = await this.weatherRepository.aggregateSummary(fromDate, toDate);

    return {
      location: 'Recife, Brasil',
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      temperature: stats.temperature,
      humidity: stats.humidity,
      wind_speed: stats.wind_speed,
      records_count: stats.count,
    };
  }

  async getTimeseries(from?: string, to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const data = await this.weatherRepository.findTimeseries(fromDate, toDate);

    return {
      points: data.map((item) => ({
        timestamp: item.timestamp.toISOString(),
        temperature: item.temperature,
        humidity: item.humidity,
      })),
    };
  }

  async exportData(format: 'csv' | 'xlsx', from?: string, to?: string): Promise<string | Buffer> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const data = await this.weatherRepository.findForExport(fromDate, toDate);

    if (format === 'csv') {
      return this.exportService.exportToCsv(data);
    } else {
      return this.exportService.exportToXlsx(data);
    }
  }

  async getInsights(): Promise<{ alerts: AlertDto[]; status: 'info' | 'warning' }> {
    // Sempre últimas 24 horas
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

    const logs = await this.weatherRepository.findForInsights(fromDate, toDate);

    if (logs.length === 0) {
      return { alerts: [], status: 'info' };
    }

    const alerts: AlertDto[] = [];
    let hasWarning = false;

    // Calcular estatísticas
    const temperatures = logs.map((log) => log.temperature);
    const humidities = logs.map((log) => log.humidity);
    const windSpeeds = logs.map((log) => log.wind_speed);
    const rainProbabilities = logs.map((log) => log.rain_probability);

    const tempMin = Math.min(...temperatures);
    const tempMax = Math.max(...temperatures);
    const tempAvg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const humidityAvg = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const windSpeedAvg = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const windSpeedMax = Math.max(...windSpeeds);
    const rainProbMax = Math.max(...rainProbabilities);
    const rainProbAvg = rainProbabilities.reduce((a, b) => a + b, 0) / rainProbabilities.length;

    const tempVariation = tempMax - tempMin;

    // Regra 1: Alta probabilidade de chuva
    if (rainProbMax >= 0.6) {
      const highRainLogs = logs.filter((log) => log.rain_probability >= 0.6);
      if (highRainLogs.length > 0) {
        const peakRain = highRainLogs.reduce((max, log) =>
          log.rain_probability > max.rain_probability ? log : max
        );
        const time = new Date(peakRain.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const rainPercent = Math.round(peakRain.rain_probability * 100);
        
        const isWarning = rainProbMax >= 0.8;
        if (isWarning) hasWarning = true;
        
        alerts.push({
          type: isWarning ? AlertType.WARNING : AlertType.INFO,
          message: `Alta probabilidade de chuva (${rainPercent}%) detectada às ${time}. ${humidityAvg > 75 ? 'Níveis de umidade estão acima da média para este horário.' : ''}`,
        });
      }
    }

    // Regra 2: Grande variação térmica
    if (tempVariation > 6) {
      hasWarning = true;
      alerts.push({
        type: AlertType.WARNING,
        message: `Variação térmica significativa detectada nas últimas 24 horas (${Math.round(tempMin)}°C a ${Math.round(tempMax)}°C, diferença de ${Math.round(tempVariation)}°C).`,
      });
    }

    // Regra 3: Alta umidade
    if (humidityAvg > 75) {
      alerts.push({
        type: AlertType.INFO,
        message: `Umidade média alta (${Math.round(humidityAvg)}%) nas últimas 24 horas. Sensação de abafamento pode ser mais intensa.`,
      });
    }

    // Regra 4: Vento forte
    if (windSpeedMax > 30) {
      hasWarning = true;
      alerts.push({
        type: AlertType.WARNING,
        message: `Vento forte detectado (até ${Math.round(windSpeedMax)} km/h) nas últimas 24 horas.`,
      });
    }

    // Regra 5: Temperatura muito alta
    if (tempMax > 35) {
      hasWarning = true;
      alerts.push({
        type: AlertType.DANGER,
        message: `Temperatura muito alta registrada (${Math.round(tempMax)}°C). Tome precauções contra insolação e desidratação.`,
      });
    }

    // Regra 6: Temperatura muito baixa (para contexto geral)
    if (tempMin < 18 && tempAvg < 20) {
      alerts.push({
        type: AlertType.INFO,
        message: `Temperaturas mais baixas registradas (mínima de ${Math.round(tempMin)}°C).`,
      });
    }

    // Se não há alertas críticos, adicionar infos sobre condições normais
    // Garantir que sempre há pelo menos um alert quando há dados
    if (alerts.length === 0 || (!hasWarning && alerts.length < 3)) {
      // Info sobre temperatura normal
      if (tempAvg >= 20 && tempAvg <= 30 && tempVariation <= 6 && alerts.length < 3) {
        alerts.push({
          type: AlertType.INFO,
          message: `Temperatura média estável nas últimas 24 horas (${Math.round(tempAvg)}°C). Condições climáticas dentro da normalidade.`,
        });
      }

      // Info sobre umidade normal
      if (humidityAvg >= 40 && humidityAvg <= 70 && alerts.length < 3) {
        alerts.push({
          type: AlertType.INFO,
          message: `Umidade média em níveis confortáveis (${Math.round(humidityAvg)}%).`,
        });
      }

      // Info sobre vento normal
      if (windSpeedAvg >= 5 && windSpeedAvg <= 20 && windSpeedMax <= 30 && alerts.length < 3) {
        alerts.push({
          type: AlertType.INFO,
          message: `Vento em condições normais (média de ${Math.round(windSpeedAvg)} km/h).`,
        });
      }

      // Info sobre probabilidade de chuva baixa
      if (rainProbMax < 0.3 && rainProbAvg < 0.2 && alerts.length < 3) {
        alerts.push({
          type: AlertType.INFO,
          message: `Baixa probabilidade de chuva nas últimas 24 horas. Condições secas predominantes.`,
        });
      }

      // Se ainda não há nenhum alert, adicionar um resumo geral
      if (alerts.length === 0) {
        alerts.push({
          type: AlertType.INFO,
          message: `Resumo das últimas 24 horas: temperatura média de ${Math.round(tempAvg)}°C, umidade de ${Math.round(humidityAvg)}% e vento médio de ${Math.round(windSpeedAvg)} km/h.`,
        });
      }
    }

    // Ordenar por prioridade (danger > warning > info) - warnings/danger sempre primeiro
    const priorityOrder = { [AlertType.DANGER]: 3, [AlertType.WARNING]: 2, [AlertType.INFO]: 1 };
    const sortedAlerts = alerts.sort((a, b) => priorityOrder[b.type] - priorityOrder[a.type]);
    
    // Separar alerts críticos (warning/danger) dos informativos
    const criticalAlerts = sortedAlerts.filter(
      (alert) => alert.type === AlertType.WARNING || alert.type === AlertType.DANGER
    );
    const infoAlerts = sortedAlerts.filter((alert) => alert.type === AlertType.INFO);
    
    // Garantir que warnings/danger sempre apareçam primeiro, depois completar com infos até 3
    const finalAlerts = [
      ...criticalAlerts,
      ...infoAlerts.slice(0, Math.max(0, 3 - criticalAlerts.length)),
    ];

    // Determinar status baseado nos alertas finais
    const finalHasWarning = finalAlerts.some(
      (alert) => alert.type === AlertType.WARNING || alert.type === AlertType.DANGER
    );

    return { 
      alerts: finalAlerts,
      status: finalHasWarning ? 'warning' : 'info'
    };
  }
}


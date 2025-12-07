import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WeatherService } from '../services/weather.service';
import { OpenMeteoService } from '../services/open-meteo.service';
import { QueryWeatherLogsDto } from '../dto/query-weather-logs.dto';
import { WeatherSummaryResponseDto } from '../dto/weather-summary-response.dto';
import { WeatherTimeseriesResponseDto } from '../dto/weather-timeseries-response.dto';
import { WeatherForecastResponseDto } from '../dto/weather-forecast-response.dto';
import { WeatherLogResponseDto } from '../dto/weather-log-response.dto';
import { WeatherInsightsResponseDto } from '../dto/weather-insights-response.dto';

@ApiTags('weather')
@Controller('weather')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WeatherQueryController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly openMeteoService: OpenMeteoService,
  ) {}

  @Get('last')
  @ApiOperation({ summary: 'Obter última leitura climática registrada' })
  @ApiResponse({ status: 200, description: 'Última leitura encontrada', type: WeatherLogResponseDto })
  @ApiResponse({ status: 404, description: 'Nenhum registro encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getLast(): Promise<WeatherLogResponseDto> {
    const log = await this.weatherService.getLast();
    return {
      timestamp: log.timestamp.toISOString(),
      location: log.location,
      latitude: log.latitude,
      longitude: log.longitude,
      temperature: log.temperature,
      feels_like: log.feels_like,
      humidity: log.humidity,
      wind_speed: log.wind_speed,
      condition: log.condition,
      rain_probability: log.rain_probability,
    };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Listar histórico de logs climáticos com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs paginada',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/WeatherLog' } },
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        has_next: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getLogs(@Query() query: QueryWeatherLogsDto) {
    return this.weatherService.getLogs(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter estatísticas agregadas (média/min/máx)' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Data inicial (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'Data final (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Estatísticas agregadas', type: WeatherSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<WeatherSummaryResponseDto> {
    return this.weatherService.getSummary(from, to);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Obter dados para gráfico temporal' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Data inicial (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'Data final (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Dados para gráfico', type: WeatherTimeseriesResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getTimeseries(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<WeatherTimeseriesResponseDto> {
    return this.weatherService.getTimeseries(from, to);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Obter previsão das próximas 24h da Open-Meteo' })
  @ApiResponse({ status: 200, description: 'Previsão do tempo', type: WeatherForecastResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getForecast(): Promise<WeatherForecastResponseDto> {
    return this.openMeteoService.getForecast();
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar dados climáticos em CSV ou XLSX' })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'xlsx'], description: 'Formato de exportação' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Data inicial (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'Data final (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado' })
  @ApiResponse({ status: 400, description: 'Formato inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async exportData(
    @Res() res: Response,
    @Query('format') format: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (format !== 'csv' && format !== 'xlsx') {
      throw new BadRequestException('Formato deve ser "csv" ou "xlsx"');
    }

    const data = await this.weatherService.exportData(format as 'csv' | 'xlsx', from, to);

    const filename = `weather-data-${new Date().toISOString().split('T')[0]}.${format}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).send(data);
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).send(data);
    }
  }

  @Get('insights')
  @ApiOperation({ summary: 'Obter insights climáticos das últimas 24 horas' })
  @ApiResponse({ status: 200, description: 'Insights climáticos', type: WeatherInsightsResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getInsights(): Promise<WeatherInsightsResponseDto> {
    return this.weatherService.getInsights();
  }
}


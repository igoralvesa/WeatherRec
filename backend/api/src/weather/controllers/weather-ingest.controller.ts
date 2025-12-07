import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from '../services/weather.service';
import { CreateWeatherLogDto } from '../dto/create-weather-log.dto';
import { WeatherLog } from '../schemas/weather-log.schema';

@ApiTags('weather')
@Controller('weather')
export class WeatherIngestController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar log de dados climáticos' })
  @ApiResponse({ status: 201, description: 'Log criado com sucesso', type: WeatherLog })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    return this.weatherService.saveLog(createWeatherLogDto);
  }
}


import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Min,
  Max,
  IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const now = new Date();
const timestamp = now.toISOString();

export class CreateWeatherLogDto {
  @ApiProperty({ example: timestamp, description: 'Timestamp ISO 8601' })
  @IsNotEmpty()
  @IsString()
  @IsISO8601()
  timestamp: string;

  @ApiProperty({ example: 'Recife, PE', description: 'Localização' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: -8.0541, description: 'Latitude' })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -34.8811, description: 'Longitude' })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 25.5, description: 'Temperatura em Celsius' })
  @IsNotEmpty()
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 26.0, description: 'Sensação térmica em Celsius', required: false })
  @IsOptional()
  @IsNumber()
  feels_like?: number;

  @ApiProperty({ example: 65, description: 'Umidade relativa (0-100%)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty({ example: 15.5, description: 'Velocidade do vento em km/h' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  wind_speed: number;

  @ApiProperty({ example: 'Partly Cloudy', description: 'Condição climática' })
  @IsNotEmpty()
  @IsString()
  condition: string;

  @ApiProperty({ example: 0.3, description: 'Probabilidade de chuva (0-1)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  rain_probability: number;

  @ApiProperty({ example: { api_data: 'raw' }, description: 'Dados brutos da API' })
  @IsObject()
  raw: Record<string, any>;
}


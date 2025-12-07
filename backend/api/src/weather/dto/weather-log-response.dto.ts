import { ApiProperty } from '@nestjs/swagger';

export class WeatherLogResponseDto {
  @ApiProperty({ example: '2025-11-30T15:15:30.909Z' })
  timestamp: string;

  @ApiProperty({ example: 'Recife, Brasil' })
  location: string;

  @ApiProperty({ example: -8.05 })
  latitude: number;

  @ApiProperty({ example: -34.9 })
  longitude: number;

  @ApiProperty({ example: 29.4 })
  temperature: number;

  @ApiProperty({ example: 30.1 })
  feels_like: number;

  @ApiProperty({ example: 70 })
  humidity: number;

  @ApiProperty({ example: 4.2 })
  wind_speed: number;

  @ApiProperty({ example: 'cloudy' })
  condition: string;

  @ApiProperty({ example: 0.3 })
  rain_probability: number;
}


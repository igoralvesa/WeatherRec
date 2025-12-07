import { ApiProperty } from '@nestjs/swagger';

class HourlyForecastDto {
  @ApiProperty({ example: '2025-12-01T00:00:00Z' })
  timestamp: string;

  @ApiProperty({ example: 28.5 })
  temperature: number;

  @ApiProperty({ example: 0.45 })
  precipitation_probability: number;
}

export class WeatherForecastResponseDto {
  @ApiProperty({ example: 'Recife, Brasil' })
  location: string;

  @ApiProperty({ type: [HourlyForecastDto] })
  hourly: HourlyForecastDto[];
}


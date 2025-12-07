import { ApiProperty } from '@nestjs/swagger';

class MetricStatsDto {
  @ApiProperty({ example: 24.1 })
  min: number;

  @ApiProperty({ example: 31.8 })
  max: number;

  @ApiProperty({ example: 28.4 })
  avg: number;
}

export class WeatherSummaryResponseDto {
  @ApiProperty({ example: 'Recife, Brasil' })
  location: string;

  @ApiProperty({ example: '2025-11-29T15:00:00Z' })
  from: string;

  @ApiProperty({ example: '2025-11-30T15:00:00Z' })
  to: string;

  @ApiProperty({ type: MetricStatsDto })
  temperature: MetricStatsDto;

  @ApiProperty({ type: MetricStatsDto })
  humidity: MetricStatsDto;

  @ApiProperty({ type: MetricStatsDto })
  wind_speed: MetricStatsDto;

  @ApiProperty({ example: 288 })
  records_count: number;
}


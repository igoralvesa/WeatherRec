import { ApiProperty } from '@nestjs/swagger';

class TimeseriesPointDto {
  @ApiProperty({ example: '2025-11-30T00:00:00Z' })
  timestamp: string;

  @ApiProperty({ example: 26.1 })
  temperature: number;

  @ApiProperty({ example: 75 })
  humidity: number;
}

export class WeatherTimeseriesResponseDto {
  @ApiProperty({ type: [TimeseriesPointDto] })
  points: TimeseriesPointDto[];
}


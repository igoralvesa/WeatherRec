import { ApiProperty } from '@nestjs/swagger';

export enum AlertType {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
}

export class AlertDto {
  @ApiProperty({ enum: AlertType, example: AlertType.INFO })
  type: AlertType;

  @ApiProperty({ 
    example: 'High probability of rain today around 3:00 PM. Humidity levels are higher than average for this time of day.' 
  })
  message: string;
}

export class WeatherInsightsResponseDto {
  @ApiProperty({ type: [AlertDto] })
  alerts: AlertDto[];

  @ApiProperty({ 
    enum: ['info', 'warning'],
    example: 'info',
    description: 'Indica se há warnings ou apenas infos nos alerts'
  })
  status: 'info' | 'warning';
}


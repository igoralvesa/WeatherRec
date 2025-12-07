import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherIngestController } from './controllers/weather-ingest.controller';
import { WeatherQueryController } from './controllers/weather-query.controller';
import { WeatherService } from './services/weather.service';
import { WeatherRepository } from './repositories/weather.repository';
import { OpenMeteoService } from './services/open-meteo.service';
import { ExportService } from './services/export.service';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
    AuthModule,
  ],
  controllers: [WeatherIngestController, WeatherQueryController],
  providers: [WeatherService, WeatherRepository, OpenMeteoService, ExportService],
  exports: [WeatherService, WeatherRepository],
})
export class WeatherModule {}


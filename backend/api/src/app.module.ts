import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, WeatherModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}


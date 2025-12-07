import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoProvider } from './mongo.provider';
import configuration from '../config/configuration';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        path.resolve(__dirname, '../../../.env'), // Raiz do projeto
        path.resolve(__dirname, '../../.env'),     // Diretório backend/api (fallback)
        '.env',                                    // Diretório atual (fallback)
      ],
      load: [configuration],
      isGlobal: true,
    }),
    MongoProvider,
  ],
  exports: [MongoProvider],
})
export class DatabaseModule {}


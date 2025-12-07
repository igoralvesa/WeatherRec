import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true, collection: 'weather_logs' })
export class WeatherLog {
  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true, type: String })
  location: string;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, type: Number })
  temperature: number;

  @Prop({ required: true, type: Number })
  feels_like: number;

  @Prop({ required: true, type: Number })
  humidity: number;

  @Prop({ required: true, type: Number })
  wind_speed: number;

  @Prop({ required: true, type: String })
  condition: string;

  @Prop({ required: true, type: Number })
  rain_probability: number;

  @Prop({ type: Object, default: {} })
  raw: Record<string, any>;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índice para consultas temporais
WeatherLogSchema.index({ timestamp: -1 });


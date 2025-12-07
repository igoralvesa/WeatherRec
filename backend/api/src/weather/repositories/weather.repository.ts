import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import { CreateWeatherLogDto } from '../dto/create-weather-log.dto';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    // Se feels_like não vier ou for null/undefined, usar temperature como fallback
    const feelsLike = createWeatherLogDto.feels_like ?? createWeatherLogDto.temperature;
    
    const weatherLogData = {
      ...createWeatherLogDto,
      timestamp: new Date(createWeatherLogDto.timestamp),
      feels_like: feelsLike,
    };

    const createdLog = new this.weatherLogModel(weatherLogData);
    return createdLog.save();
  }

  async findLast(): Promise<WeatherLog | null> {
    return this.weatherLogModel
      .findOne()
      .sort({ timestamp: -1 })
      .select('-raw')
      .exec();
  }

  async findPaginated(
    from?: Date,
    to?: Date,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: WeatherLog[]; total: number }> {
    const query: any = {};

    if (from || to) {
      query.timestamp = {};
      if (from) {
        query.timestamp.$gte = from;
      }
      if (to) {
        query.timestamp.$lte = to;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('-raw')
        .exec(),
      this.weatherLogModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async aggregateSummary(from?: Date, to?: Date): Promise<{
    temperature: { min: number; max: number; avg: number };
    humidity: { min: number; max: number; avg: number };
    wind_speed: { min: number; max: number; avg: number };
    count: number;
  }> {
    const matchStage: any = {};

    if (from || to) {
      matchStage.timestamp = {};
      if (from) {
        matchStage.timestamp.$gte = from;
      }
      if (to) {
        matchStage.timestamp.$lte = to;
      }
    }

    const result = await this.weatherLogModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          avgTemp: { $avg: '$temperature' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          avgHumidity: { $avg: '$humidity' },
          minWindSpeed: { $min: '$wind_speed' },
          maxWindSpeed: { $max: '$wind_speed' },
          avgWindSpeed: { $avg: '$wind_speed' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0 || result[0].count === 0) {
      return {
        temperature: { min: 0, max: 0, avg: 0 },
        humidity: { min: 0, max: 0, avg: 0 },
        wind_speed: { min: 0, max: 0, avg: 0 },
        count: 0,
      };
    }

    const stats = result[0];
    return {
      temperature: {
        min: stats.minTemp || 0,
        max: stats.maxTemp || 0,
        avg: stats.avgTemp || 0,
      },
      humidity: {
        min: stats.minHumidity || 0,
        max: stats.maxHumidity || 0,
        avg: stats.avgHumidity || 0,
      },
      wind_speed: {
        min: stats.minWindSpeed || 0,
        max: stats.maxWindSpeed || 0,
        avg: stats.avgWindSpeed || 0,
      },
      count: stats.count || 0,
    };
  }

  async findTimeseries(from?: Date, to?: Date): Promise<
    Array<{
      timestamp: Date;
      temperature: number;
      humidity: number;
    }>
  > {
    const query: any = {};

    if (from || to) {
      query.timestamp = {};
      if (from) {
        query.timestamp.$gte = from;
      }
      if (to) {
        query.timestamp.$lte = to;
      }
    }

    return this.weatherLogModel
      .find(query)
      .select('timestamp temperature humidity')
      .sort({ timestamp: 1 })
      .exec();
  }

  async findForExport(from?: Date, to?: Date): Promise<WeatherLog[]> {
    const query: any = {};

    if (from || to) {
      query.timestamp = {};
      if (from) {
        query.timestamp.$gte = from;
      }
      if (to) {
        query.timestamp.$lte = to;
      }
    }

    return this.weatherLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .select('-raw')
      .exec();
  }

  async findForInsights(from: Date, to: Date): Promise<WeatherLog[]> {
    return this.weatherLogModel
      .find({
        timestamp: {
          $gte: from,
          $lte: to,
        },
      })
      .select('timestamp temperature humidity wind_speed rain_probability condition')
      .sort({ timestamp: 1 })
      .exec();
  }
}


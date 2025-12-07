import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { WeatherLog } from '../schemas/weather-log.schema';

@Injectable()
export class ExportService {
  exportToCsv(data: WeatherLog[]): string {
    const headers = [
      'timestamp',
      'location',
      'latitude',
      'longitude',
      'temperature',
      'humidity',
      'wind_speed',
      'condition',
      'rain_probability',
    ];

    const rows = data.map((log) => [
      log.timestamp.toISOString(),
      log.location,
      log.latitude,
      log.longitude,
      log.temperature,
      log.humidity,
      log.wind_speed,
      log.condition,
      log.rain_probability,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  exportToXlsx(data: WeatherLog[]): Buffer {
    const worksheetData = data.map((log) => ({
      timestamp: log.timestamp.toISOString(),
      location: log.location,
      latitude: log.latitude,
      longitude: log.longitude,
      temperature: log.temperature,
      humidity: log.humidity,
      wind_speed: log.wind_speed,
      condition: log.condition,
      rain_probability: log.rain_probability,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}


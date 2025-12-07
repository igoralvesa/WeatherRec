import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ForecastDataPoint {
  time: string;
  temperature: number;
  precipitationProbability: number;
}

interface ForecastCardProps {
  data: ForecastDataPoint[];
  className?: string;
}

export function ForecastCard({ data, className }: ForecastCardProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Previsão das Próximas 24h</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              barCategoryGap="40%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  // Extrai apenas a hora do formato "HH:MM" e adiciona "h"
                  return `${value.split(':')[0]}h`;
                }}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
                label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                label={{ value: 'Chuva (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-card)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => {
                  if (name === 'Temperatura (°C)') {
                    return [`${value.toFixed(1)}°C`, name];
                  }
                  if (name === 'Chance de Chuva (%)') {
                    return [`${value.toFixed(0)}%`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar
                yAxisId="left"
                dataKey="temperature"
                name="Temperatura (°C)"
                fill="hsl(var(--weather-sun))"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                yAxisId="right"
                dataKey="precipitationProbability"
                name="Chance de Chuva (%)"
                fill="hsl(var(--weather-rain))"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

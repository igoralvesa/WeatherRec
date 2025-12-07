import requests
from datetime import datetime
from typing import Optional, Dict
from config import OPEN_METEO_BASE_URL, WEATHER_CODE_MAP


class WeatherClient:
    
    def __init__(self, base_url: str = OPEN_METEO_BASE_URL, timeout: int = 10):
        self.base_url = base_url
        self.timeout = timeout
    
    def get_weather_data(self, latitude: float, longitude: float, location_name: str) -> Optional[Dict]:
        try:
            params = {
                'latitude': latitude,
                'longitude': longitude,
                'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation_probability',
                'timezone': 'America/Sao_Paulo',
                'forecast_days': 1
            }
            
            response = requests.get(self.base_url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            # A API retorna current como objeto com arrays de valores
            current = data.get('current', {})
            
            # Extrair valores de current (que vem como arrays)
            # Exemplo: {'temperature_2m': [27.5], 'apparent_temperature': [28.2], ...}
            def get_first_value(value, default=0):
                """Extrai o primeiro valor de um array ou retorna o valor direto"""
                if isinstance(value, list) and len(value) > 0:
                    return value[0]
                return value if value is not None else default
            
            temperature_2m = get_first_value(current.get('temperature_2m', [0]))
            apparent_temp = get_first_value(current.get('apparent_temperature', []), None)
            humidity_value = get_first_value(current.get('relative_humidity_2m', [0]))
            wind_speed_value = get_first_value(current.get('wind_speed_10m', [0]))
            weather_code = get_first_value(current.get('weather_code', [0]))
            precipitation_probability = get_first_value(current.get('precipitation_probability', [0]), 0.0)
            
            # Se apparent_temperature não foi encontrado, usar temperature como fallback
            if apparent_temp is None:
                apparent_temp = temperature_2m
            
            # A API retorna precipitation_probability como valor entre 0-100, converter para 0-1
            rain_probability = precipitation_probability / 100.0 if precipitation_probability > 1 else precipitation_probability
            
            return {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'location': location_name,
                'latitude': latitude,
                'longitude': longitude,
                'temperature': round(temperature_2m, 1),
                'feels_like': round(apparent_temp, 1),
                'humidity': humidity_value,
                'wind_speed': round(wind_speed_value, 1),
                'condition': WEATHER_CODE_MAP.get(weather_code, 'unknown'),
                'rain_probability': round(rain_probability, 2),
                'raw': current
            }
        except Exception as e:
            print(f"Erro ao coletar dados para {location_name}: {e}")
            return None

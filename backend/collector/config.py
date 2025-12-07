import os
from dotenv import load_dotenv
from pathlib import Path

# Carregar .env da raiz do projeto (3 níveis acima: collector -> backend -> root)
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(env_path)

RABBITMQ_URL = os.getenv('RABBITMQ_URL')
QUEUE_NAME = os.getenv('QUEUE_NAME')

COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '3600'))  # 3600 segundos = 1 hora padrão

OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

# Localização fixa - Recife, Brasil
LOCATION_NAME = "Recife, Brasil"
LOCATION_LATITUDE = -8.05
LOCATION_LONGITUDE = -34.9

# Mapeamento completo de weather_code WMO para condition
# Baseado no padrão WMO (World Meteorological Organization) 0-99
WEATHER_CODE_MAP = {
    # Céu limpo e parcialmente nublado
    0: 'clear',
    1: 'clear',
    2: 'partly_cloudy',
    3: 'cloudy',
    
    # Visibilidade reduzida e névoa
    4: 'smoky',
    5: 'haze',
    45: 'foggy',
    48: 'foggy',
    
    # Garoa (drizzle)
    51: 'drizzle',
    53: 'drizzle',
    55: 'drizzle',
    56: 'freezing_drizzle',
    57: 'freezing_drizzle',
    
    # Chuva (rain)
    61: 'rain',
    63: 'rain',
    65: 'rain',
    66: 'freezing_rain',
    67: 'freezing_rain',
    68: 'rain_and_drizzle',
    69: 'rain_and_drizzle',
    
    # Neve (snow)
    71: 'snow',
    73: 'snow',
    75: 'snow',
    77: 'snow_grains',
    
    # Precipitação mista
    80: 'rain_shower',
    81: 'rain_shower',
    82: 'rain_shower',
    83: 'snow_rain_shower',
    84: 'snow_rain_shower',
    85: 'snow_shower',
    86: 'snow_shower',
    87: 'snow_grains_shower',
    88: 'snow_grains_shower',
    
    # Tempestades (thunderstorms)
    95: 'thunderstorm',
    96: 'thunderstorm',
    97: 'thunderstorm',
    98: 'thunderstorm',
    99: 'thunderstorm',
}

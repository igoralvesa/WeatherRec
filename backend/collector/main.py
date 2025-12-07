import time
import schedule
from datetime import datetime
from config import LOCATION_NAME, LOCATION_LATITUDE, LOCATION_LONGITUDE, COLLECTION_INTERVAL, QUEUE_NAME, RABBITMQ_URL
from weather_client import WeatherClient
from rabbitmq_client import RabbitMQClient


class CollectorService:
    
    def __init__(self):
        self.weather_client = WeatherClient()
        self.rabbitmq_client = RabbitMQClient()
    
    def collect_and_publish(self):
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando coleta de dados...")
        
        weather_data = self.weather_client.get_weather_data(
            LOCATION_LATITUDE,
            LOCATION_LONGITUDE,
            LOCATION_NAME
        )
        
        if weather_data and self.rabbitmq_client.publish(weather_data):
            print(f"✓ Dados coletados e publicados: {LOCATION_NAME}")
        else:
            print(f"✗ Erro ao coletar/publicar dados para {LOCATION_NAME}")
        
        print("Coleta concluída!\n")
    
    def start(self):
        print("=" * 60)
        print("Collector Service - Coleta de Dados Climáticos")
        print("=" * 60)
        print(f"Message Broker: RabbitMQ")
        print(f"RabbitMQ URL: {RABBITMQ_URL}")
        print(f"Fila: {QUEUE_NAME}")
        print(f"Intervalo de coleta: {COLLECTION_INTERVAL} segundos ({COLLECTION_INTERVAL/60:.1f} minutos)")
        print(f"Localização: {LOCATION_NAME}")
        print("=" * 60)
        
        if not self.rabbitmq_client.connect():
            print("✗ Não foi possível conectar ao RabbitMQ. Encerrando...")
            return
        
        self.collect_and_publish()
        schedule.every(COLLECTION_INTERVAL).seconds.do(self.collect_and_publish)
        print("Serviço iniciado. Aguardando próximas coletas...\n")
        
        last_heartbeat_check = time.time()
        heartbeat_interval = 20
        
        try:
            while True:
                schedule.run_pending()
                
                current_time = time.time()
                if current_time - last_heartbeat_check >= heartbeat_interval:
                    self.rabbitmq_client.keep_alive()
                    last_heartbeat_check = current_time
                
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\nEncerrando serviço...")
            self.rabbitmq_client.close()
            print("Serviço encerrado.")


def main():
    service = CollectorService()
    service.start()


if __name__ == '__main__':
    main()

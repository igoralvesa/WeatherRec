import json
import pika
from typing import Dict, Optional
from config import RABBITMQ_URL, QUEUE_NAME


class RabbitMQClient:
    
    def __init__(self, rabbitmq_url: str = RABBITMQ_URL, queue_name: str = QUEUE_NAME):
        self.rabbitmq_url = rabbitmq_url
        self.queue_name = queue_name
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel: Optional[pika.channel.Channel] = None
    
    def connect(self) -> bool:
        self.close()
        
        try:
            parameters = pika.URLParameters(self.rabbitmq_url)
            parameters.heartbeat = 30
            parameters.connection_attempts = 3
            parameters.retry_delay = 2
            parameters.socket_timeout = 10
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            
            print(f"✓ Conectado ao RabbitMQ: {self.queue_name}")
            return True
        except Exception as e:
            print(f"✗ Erro ao conectar ao RabbitMQ: {e}")
            self.connection = None
            self.channel = None
            return False
    
    def keep_alive(self) -> bool:
        if not self.connection or self.connection.is_closed:
            return False
        
        try:
            self.connection.process_data_events(time_limit=0)
            return True
        except:
            return False
    
    def _is_connection_alive(self) -> bool:
        if not self.connection or self.connection.is_closed:
            return False
        if not self.channel or self.channel.is_closed:
            return False
        
        try:
            self.connection.process_data_events(time_limit=0)
            return True
        except:
            return False
    
    def publish(self, message: Dict) -> bool:
        try:
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type='application/json',
                )
            )
            print(f"✓ Dados publicados no RabbitMQ: {message.get('location', 'unknown')} - {message.get('timestamp', 'unknown')}")
            return True
        except (pika.exceptions.AMQPConnectionError, pika.exceptions.StreamLostError, 
                pika.exceptions.ChannelWrongStateError):
            print("⚠ Conexão com o broker foi perdida")
            return False
        except Exception as e:
            print(f"✗ Erro ao publicar no RabbitMQ: {e}")
            return False
    
    def close(self):
        if self.channel and not self.channel.is_closed:
            self.channel.close()
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        self.connection = None
        self.channel = None

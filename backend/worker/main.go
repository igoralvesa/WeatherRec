package main

import (
	"log"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	// Carregar variáveis do arquivo .env da raiz do projeto
	// Tenta múltiplos caminhos para garantir compatibilidade
	envPaths := []string{
		"../../.env",           // Raiz do projeto (worker -> backend -> root)
		"../../../.env",       // Alternativa caso estrutura seja diferente
		".env",                 // Diretório atual (fallback)
	}
	
	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			log.Printf("Variáveis de ambiente carregadas de: %s", path)
			break
		}
	}

	rabbitmqURL := getEnv("RABBITMQ_URL", "amqp://admin:admin123@localhost:5672")
	apiURL := getEnv("API_URL", "http://localhost:3000")

	log.Println(strings.Repeat("=", 60))
	log.Println("Worker Service - Processamento de Dados Climáticos")
	log.Println(strings.Repeat("=", 60))
	log.Printf("RabbitMQ URL: %s", maskPassword(rabbitmqURL))
	log.Printf("API URL: %s", apiURL)
	log.Printf("Fila: %s", queueName)
	log.Println(strings.Repeat("=", 60))

	// Conectar ao RabbitMQ
	conn, err := connectRabbitMQ(rabbitmqURL)
	if err != nil {
		log.Fatalf("Erro ao conectar ao RabbitMQ: %v", err)
	}
	defer conn.Close()

	// Abrir canal de comunicação
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	// Declarar fila (garante que existe, cria se não existir)
	_, err = ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao declarar fila: %v", err)
	}

	// Configurar QoS: processar 1 mensagem por vez (garante processamento sequencial)
	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		log.Fatalf("Erro ao configurar QoS: %v", err)
	}

	// Registrar consumer para receber mensagens da fila
	msgs, err := ch.Consume(
		queueName,
		"",    // consumer tag
		false, // auto-ack (false = ACK manual após processamento)
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao registrar consumer: %v", err)
	}

	log.Println("Aguardando mensagens. Para sair pressione CTRL+C")

	// Loop infinito: processar cada mensagem recebida
	for msg := range msgs {
		if err := processMessage(msg, apiURL, ch); err != nil {
			log.Printf("Erro ao processar mensagem: %v", err)
		}
	}
}

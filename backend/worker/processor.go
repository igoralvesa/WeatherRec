package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/streadway/amqp"
)

// processMessage processa uma mensagem recebida da fila RabbitMQ: deserializa, valida e envia para a API com retry
func processMessage(msg amqp.Delivery, apiURL string, ch *amqp.Channel) error {
	var reading WeatherReading

	// Deserializar JSON da mensagem
	if err := json.Unmarshal(msg.Body, &reading); err != nil {
		log.Printf("Erro ao fazer unmarshal: %v", err)
		msg.Nack(false, false) // Rejeitar sem requeue (payload inválido)
		return err
	}

	// Validar dados antes de enviar
	if err := validateReading(&reading); err != nil {
		log.Printf("Dados inválidos: %v", err)
		msg.Nack(false, false) // Rejeitar sem requeue (dados inválidos)
		return err
	}

	log.Printf("Processando: %s - %s (%.1f°C, feels_like: %.1f°C)", reading.Location, reading.Timestamp, reading.Temperature, reading.FeelsLike)

	// Tentar enviar para API com retry (até maxRetries tentativas)
	success := false
	for i := 0; i < maxRetries; i++ {
		if err := sendToAPI(&reading, apiURL); err != nil {
			log.Printf("Tentativa %d/%d falhou: %v", i+1, maxRetries, err)
			if i < maxRetries-1 {
				time.Sleep(retryDelay)
			}
		} else {
			success = true
			break
		}
	}

	if success {
		msg.Ack(false) // Confirmar processamento bem-sucedido
		log.Printf("✓ Dados enviados com sucesso: %s", reading.Location)
		return nil
	} else {
		msg.Nack(false, true) // NACK com requeue para tentar novamente depois
		log.Printf("✗ Falha ao enviar após %d tentativas: %s", maxRetries, reading.Location)
		return fmt.Errorf("falha ao enviar após %d tentativas", maxRetries)
	}
}

package main

import (
	"crypto/tls"
	"fmt"
	"net/url"
	"strings"

	"github.com/streadway/amqp"
)

// connectRabbitMQ estabelece conexão com RabbitMQ, suportando TLS (amqps://) e conexões não-TLS (amqp://)
func connectRabbitMQ(rabbitmqURL string) (*amqp.Connection, error) {
	if strings.HasPrefix(rabbitmqURL, "amqps://") {
		// Converter amqps:// para amqp:// e configurar TLS
		amqpURL := strings.Replace(rabbitmqURL, "amqps://", "amqp://", 1)

		u, err := url.Parse(amqpURL)
		if err != nil {
			return nil, fmt.Errorf("erro ao parsear URL: %w", err)
		}

		config := &tls.Config{
			ServerName:         u.Hostname(),
			InsecureSkipVerify: false,
		}

		conn, err := amqp.DialTLS(amqpURL, config)
		if err != nil {
			return nil, fmt.Errorf("erro ao conectar com TLS: %w", err)
		}

		return conn, nil
	}

	// Conexão não-TLS padrão
	return amqp.Dial(rabbitmqURL)
}

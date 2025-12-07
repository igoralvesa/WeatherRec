package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// sendToAPI envia os dados de clima para o endpoint POST /weather/logs da API NestJS
func sendToAPI(reading *WeatherReading, apiURL string) error {
	// Garantir que feels_like sempre tenha um valor válido
	// Se feels_like for 0 (zero value do Go), usar temperature como fallback
	if reading.FeelsLike == 0 {
		reading.FeelsLike = reading.Temperature
	}
	
	jsonData, err := json.Marshal(reading)
	if err != nil {
		return fmt.Errorf("erro ao fazer marshal: %w", err)
	}
	
	log.Printf("Enviando JSON (feels_like=%.1f): %s", reading.FeelsLike, string(jsonData))

	req, err := http.NewRequest("POST", apiURL+"/weather/logs", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao fazer request: %w", err)
	}
	defer resp.Body.Close()

	// Verificar se status code está no range de sucesso (2xx)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("status code %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

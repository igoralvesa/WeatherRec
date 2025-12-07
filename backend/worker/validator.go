package main

import (
	"fmt"
	"time"
)

func validateReading(reading *WeatherReading) error {
	if reading.Location == "" {
		return fmt.Errorf("localização vazia")
	}
	if reading.Condition == "" {
		return fmt.Errorf("condition vazio")
	}
	if reading.Timestamp == "" {
		return fmt.Errorf("timestamp vazio")
	}
	if _, err := time.Parse(time.RFC3339, reading.Timestamp); err != nil {
		return fmt.Errorf("timestamp inválido (deve ser ISO 8601): %v", err)
	}
	if reading.Latitude < -90 || reading.Latitude > 90 {
		return fmt.Errorf("latitude fora do range válido: %.2f", reading.Latitude)
	}
	if reading.Longitude < -180 || reading.Longitude > 180 {
		return fmt.Errorf("longitude fora do range válido: %.2f", reading.Longitude)
	}
	if reading.Temperature < -50 || reading.Temperature > 60 {
		return fmt.Errorf("temperatura fora do range válido: %.1f", reading.Temperature)
	}
	if reading.FeelsLike < -50 || reading.FeelsLike > 60 {
		return fmt.Errorf("feels_like fora do range válido: %.1f", reading.FeelsLike)
	}
	if reading.Humidity < 0 || reading.Humidity > 100 {
		return fmt.Errorf("umidade fora do range válido: %d", reading.Humidity)
	}
	if reading.WindSpeed < 0 || reading.WindSpeed > 200 {
		return fmt.Errorf("velocidade do vento fora do range válido: %.1f", reading.WindSpeed)
	}
	if reading.RainProbability < 0 || reading.RainProbability > 1 {
		return fmt.Errorf("rain_probability fora do range válido: %.2f", reading.RainProbability)
	}
	return nil
}

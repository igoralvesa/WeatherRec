package main

type WeatherReading struct {
	Timestamp       string                 `json:"timestamp"`
	Location        string                 `json:"location"`
	Latitude        float64                `json:"latitude"`
	Longitude       float64                `json:"longitude"`
	Temperature     float64                `json:"temperature"`
	FeelsLike       float64                `json:"feels_like"` // Sempre incluído, mesmo quando 0
	Humidity        int                    `json:"humidity"`
	WindSpeed       float64                `json:"wind_speed"`
	Condition       string                 `json:"condition"`
	RainProbability float64                `json:"rain_probability"`
	Raw             map[string]interface{} `json:"raw"`
}

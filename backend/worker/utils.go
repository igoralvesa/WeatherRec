package main

import (
	"net/url"
	"os"
	"strings"
)

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func maskPassword(urlStr string) string {
	u, err := url.Parse(urlStr)
	if err != nil {
		return urlStr
	}

	if u.User != nil {
		password, _ := u.User.Password()
		if password != "" {
			maskedPassword := strings.Repeat("*", len(password))
			u.User = url.UserPassword(u.User.Username(), maskedPassword)
		}
	}

	return u.String()
}

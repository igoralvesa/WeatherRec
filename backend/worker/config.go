package main

import "time"

const (
	queueName  = "weather.readings"
	maxRetries = 3
	retryDelay = 5 * time.Second
)

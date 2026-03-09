#!/bin/bash

# Kill all background processes when script exits
trap "echo 'Stopping servers...'; kill 0" EXIT

# Start Go auth service
cd auth_service
go run ./cmd/server/main.go &

# Start Next.js frontend
cd ../akssora_search
bun dev &

# Start FastAPI service
cd ../search_model_service
source .venv/bin/activate
fastapi dev --port 8080 &

# Wait for all processes
wait
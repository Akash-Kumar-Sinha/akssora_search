#!/bin/bash

trap "echo 'Stopping servers...'; kill 0" EXIT

cd auth_service
go run ./cmd/server/main.go &

cd ../akssora_search
bun dev &

cd ../search_model_service
source .venv/bin/activate
fastapi dev --port 8080 &

wait
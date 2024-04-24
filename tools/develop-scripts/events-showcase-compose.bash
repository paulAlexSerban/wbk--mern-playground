#!/bin/bash
# makes sure the folder containing the script will be the root folder
cd "$(dirname "$0")" || exit

function up() {
    echo "[ 🟢 🐳 compose up ]"
    docker compose --env-file ../../infrastructure/env/events-showcase.compose.env \
    --file ../../infrastructure/docker/docker-compose.events-showcase.dev.yml \
    up --detach --build
    docker compose --env-file ../../infrastructure/env/events-showcase.compose.env \
    ps
}

function down() {
    echo "[ 🛑 🐳 compose down ]"
    docker compose --env-file ../../infrastructure/env/events-showcase.compose.env \
    --file ../../infrastructure/docker/docker-compose.events-showcase.dev.yml \
    down --volumes --rmi all
    docker compose --env-file ../../infrastructure/env/events-showcase.compose.env \
    ps
}

function logs() {
    echo "[ 📜 🐳 compose logs ]"
    docker compose --env-file ../../infrastructure/env/events-showcase.compose.env \
    --file ../../infrastructure/docker/docker-compose.events-showcase.dev.yml \
    logs --follow
}

function help() {
    echo "Usage: $0 {up|down|logs}"
}

$1
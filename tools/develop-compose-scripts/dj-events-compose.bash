#!/bin/bash
# makes sure the folder containing the script will be the root folder
cd "$(dirname "$0")" || exit

export HOST_USER_ID=$(id -u)
export HOST_GROUP_ID=$(id -g)

ENV_FILE="../../infrastructure/env/dj-events.compose.env"
COMPOSE_FILE_DEV="../../infrastructure/docker/dev/docker-compose.dj-events.dev.yml"

function list() {
    echo "[ 📜 🐳 compose list ]"
    docker compose \
        --env-file ${ENV_FILE} \
        --file ${COMPOSE_FILE_DEV} ps
}

function up() {
    echo "[ 🟢 🐳 compose up ]"
    docker compose \
        --env-file ${ENV_FILE} \
        --file ${COMPOSE_FILE_DEV} up \
        --detach --build
    list
}

function recreate-ssr-service() {
    echo "[ 🔄 🐳 compose recreate ssr-service ]"
    docker compose \
        --env-file ${ENV_FILE} \
        --file ${COMPOSE_FILE_DEV} up \
        --detach --build --force-recreate ssr-service
    list
}

function down() {
    echo "[ 🛑 🐳 compose down ]"
    docker compose \
        --env-file ${ENV_FILE} \
        --file ${COMPOSE_FILE_DEV} down \
        --volumes --rmi all
    list
}

function logs() {
    echo "[ 📜 🐳 compose logs ]"
    docker compose \
        --env-file ${ENV_FILE} \
        --file ${COMPOSE_FILE_DEV} logs \
        --follow
}

function help() {
    echo "Usage: $0 {up|down|logs}"
}

$1

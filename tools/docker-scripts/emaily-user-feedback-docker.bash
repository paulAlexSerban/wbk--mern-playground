#!/bin/bash
# makes sure the folder containing the script will be the root folder
cd "$(dirname "$0")" || exit

. ../../.env
. ../../infrastructure/env/emaily-user-feedback.compose.env

PROJECT_NAME=$(node -p "require('../../backend/api/emaily-user-feedback-api/package.json').name.split('/').pop()")
PROJECT_VERSION=$(node -p "require('../../backend/api/emaily-user-feedback-api/package.json').version")

function run() {
  docker run --detach -p 3000:5000 --name emaily-user-feedback-api \
    --env NODE_ENV=production \
    --env EMAILY_GOOGLE_OAUTH_CLIENT_ID=$EMAILY_GOOGLE_OAUTH_CLIENT_ID \
    --env EMAILY_GOOGLE_OAUTH_CLIENT_SECRET=$EMAILY_GOOGLE_OAUTH_CLIENT_SECRET \
    --env EMAILY_GOOGLE_OAUTH_CALLBACK_URL=$EMAILY_GOOGLE_OAUTH_CALLBACK_URL \
    --env EMAILY_COOKIE_KEY=$EMAILY_COOKIE_KEY \
    --env DB_URI=$DB_ATLAS_URI \
    --env PORT=$PORT \
    paulserbandev/emaily-user-feedback-api
}

function build() {
  echo "Building $PROJECT_NAME:$PROJECT_VERSION"

  # get latest docker image build from same Dockerfile and remove latest tag
  docker rmi $(docker images -q $PROJECT_NAME:latest)

  # Build the docker image

  docker build --tag "paulserbandev/$PROJECT_NAME:$PROJECT_VERSION" \
    --tag "paulserbandev/$PROJECT_NAME:latest" \
    --file ../../backend/api/emaily-user-feedback-api/prod.Dockerfile ../../backend/api/emaily-user-feedback-api/
}

$1

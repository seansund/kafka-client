#!/usr/bin/env bash

SERVICE_NAME="$1"

if [[ -z "${SERVICE_NAME}" ]]; then
  echo "Usage: setup-credentials.sh SERVICE_NAME"
  exit 1
fi

if ! command -v jq 1> /dev/null 2> /dev/null; then
  echo "jq cli is required for this script."
  echo "Visit https://stedolan.github.io/jq/download/ for instructions to install it"
  exit 1
fi

echo "Retrieving the service id from the service name: ${SERVICE_NAME}"
SERVICE_ID=$(ibmcloud resource service-instance "${SERVICE_NAME}" --output json | jq -r '.[] | .id // empty')

if [[ -z "${SERVICE_ID}" ]]; then
  echo "Unable to find service: ${SERVICE_NAME}"
  echo "Check your account and target region and resource group"
  exit 1
fi

echo "Retrieving credentials associated with the service id: ${SERVICE_ID}"
CREDENTIALS=$(ibmcloud resource service-keys --output json | jq --arg ID "${SERVICE_ID}" '[.[] | select(.source_crn == $ID)][0] | .credentials // empty')

if [[ -z "${CREDENTIALS}" ]]; then
  echo "Unable to find credentials for service: ${SERVICE_NAME}"
  echo "Generate credentials for the service and try again"
  exit 1
fi

echo "Writing service credentials to ./kafka-config.json"
echo "${CREDENTIALS}" > ./kafka-config.json

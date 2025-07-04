#!/bin/bash

# Deploy rápido con variables de entorno
echo "Iniciando deploy..."

# Configurar proyecto
gcloud config set project dtwo-qa

# Ejecutar Cloud Build
gcloud builds submit --config=cloudbuild.yaml .

echo "Deploy completado!"

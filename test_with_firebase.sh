#!/bin/bash

# Firebase Configuration Script
# Sets up Firebase environment variables for testing

echo "🔧 Setting up Firebase configuration..."

# Set Firebase credentials path to the available file
export GOOGLE_APPLICATION_CREDENTIALS="/Users/gibrann/Desktop/mcp_orchestrator_v1/firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json"

# Set Firebase project ID (extracted from filename)
export FIRESTORE_PROJECT_ID="dtwo-firebase"
export GOOGLE_CLOUD_PROJECT="dtwo-firebase"

echo "✅ Firebase configuration set:"
echo "  GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS"
echo "  FIRESTORE_PROJECT_ID: $FIRESTORE_PROJECT_ID"
echo "  GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT"

echo ""
echo "🧪 Now testing with Firebase enabled..."
echo "Running: npx ts-node test_specific_user.ts"

# Run the test with Firebase configured
npx ts-node test_specific_user.ts

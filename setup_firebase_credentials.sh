#!/bin/bash

# Guía para reemplazar credenciales de Firebase
echo "🔄 Reemplazando credenciales de Firebase..."

echo ""
echo "📋 INSTRUCCIONES:"
echo "1. Descarga el archivo JSON de Firebase Console"
echo "2. Copia el archivo descargado a este directorio:"
echo "   /Users/gibrann/Desktop/mcp_orchestrator_v1/firestore/"
echo ""
echo "3. Renombra el archivo a:"
echo "   dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json"
echo ""
echo "4. O actualiza el .env para usar el nuevo nombre del archivo"
echo ""

echo "📂 Archivos actuales en firestore/:"
ls -la ./firestore/

echo ""
echo "🔧 Variables actuales en .env:"
grep -E "(GOOGLE_APPLICATION_CREDENTIALS|FIRESTORE_PROJECT_ID|FIREBASE_CREDENTIALS)" .env

echo ""
echo "✅ Una vez reemplazado, ejecuta:"
echo "   npx ts-node test_specific_user.ts"

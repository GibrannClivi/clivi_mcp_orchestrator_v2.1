# 🔧 Configuración

## 📝 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Environment
ENV=production
PROJECT_NAME=mcp-orchestrator-v1
PORT=4000

# Chargebee Configuration
CHARGEBEE_SITE=tu-sitio-test
CHARGEBEE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxx

# HubSpot Configuration  
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_PORTAL_ID=tu-portal-id

# Firebase/Firestore Configuration
FIRESTORE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_CREDENTIALS=./firestore/tu-archivo-credenciales.json
GOOGLE_CLOUD_PROJECT=tu-proyecto-firebase
GOOGLE_APPLICATION_CREDENTIALS=./firestore/tu-archivo-credenciales.json

# MCP Configuration
USE_REAL_MCP=true

# Cache configuration
CACHE_TTL_SECONDS=3600

# CORS
CORS_ALLOW_ORIGINS=*

# GraphQL Development
GRAPHQL_INTROSPECTION=true
GRAPHQL_PLAYGROUND=true
```

## 🔑 Obtención de Credenciales

### **Chargebee**
1. Ir a Chargebee Settings → API Keys
2. Copiar `Site Name` y `Test API Key`
3. Para producción, usar `Live API Key`

### **HubSpot**
1. Ir a HubSpot Settings → Private Apps
2. Crear nueva app con permisos de CRM
3. Copiar el `Access Token` generado

### **Firebase/Firestore**
1. Ir a Firebase Console → Project Settings
2. Service Accounts → Generate new private key
3. Descargar archivo JSON y colocarlo en `./firestore/`

## 📦 Instalación Local

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd mcp_orchestrator_v1

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con tus credenciales

# Compilar TypeScript
npm run build

# Ejecutar servidor
npm start
```

## 🧪 Validación de Configuración

```bash
# Test de conectividad
npm run test:connections

# Validar configuración
npm run validate:config

# Test con usuario específico
npm run test:user -- test@upgradebalance.com
```

---

# 🧪 Testing y Validación

## ✅ Tests Automatizados

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm run test:unit          # Tests unitarios
npm run test:integration   # Tests de integración
npm run test:graphql      # Tests de GraphQL

# Coverage
npm run test:coverage
```

## 🔍 Validación Manual

### **Test de Usuario Específico**
```bash
# Script de validación personalizada
node scripts/validate_user.js test@upgradebalance.com
```

### **Test de Conectividad**
```bash
# Verificar todas las integraciones
node scripts/test_connections.js
```

### **Debug de Datos**
```bash
# Debug detallado de una consulta
DEBUG=mcp:* npm start
```

## 📊 Métricas de Calidad

- **Cobertura de Tests**: >85%
- **Tiempo de Respuesta**: <3 segundos
- **Exactitud de Datos**: 100% (sin contaminación)
- **Disponibilidad**: >99.9%

---

# 🌐 Despliegue

## 🚀 Google Cloud Run

### **Despliegue Automático**
```bash
# Script de despliegue completo
./deploy-cloudrun.sh
```

### **Despliegue Manual**
```bash
# Build de imagen Docker
docker build -t gcr.io/tu-proyecto/mcp-orchestrator .

# Push a Container Registry
docker push gcr.io/tu-proyecto/mcp-orchestrator

# Deploy a Cloud Run
gcloud run deploy mcp-orchestrator \
  --image gcr.io/tu-proyecto/mcp-orchestrator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000 \
  --memory 1Gi \
  --cpu 1
```

### **Configuración de Cloud Run**
- **CPU**: 1 vCPU
- **Memoria**: 1 GB
- **Concurrencia**: 100 requests
- **Timeout**: 300 segundos
- **Puerto**: 4000

## 🔧 Variables de Entorno en Cloud Run

```bash
# Configurar secrets
gcloud run services update mcp-orchestrator \
  --set-env-vars="ENV=production" \
  --set-secrets="CHARGEBEE_API_KEY=chargebee-key:latest" \
  --set-secrets="HUBSPOT_ACCESS_TOKEN=hubspot-token:latest"
```

## 📡 Health Checks

```bash
# Endpoint de salud
GET /health

# Respuesta esperada
{
  "status": "healthy",
  "timestamp": "2025-07-03T00:00:00.000Z",
  "uptime": 12345,
  "connections": {
    "chargebee": "connected",
    "hubspot": "connected", 
    "firestore": "connected"
  }
}
```

---

# 📈 Casos de Uso

## 🏥 **Sistema de Salud Digital**

### **Vista 360° del Paciente**
```graphql
query PacienteCompleto($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Información personal
    name
    email
    phone
    
    # Datos de suscripción/plan
    plan
    subscriptionStatus
    
    # Historial médico completo
    healthSummary
    treatments
    allergies
    medicineCount
    
    # Trazabilidad de datos
    sourceBreakdown {
      field
      source
    }
  }
}
```

### **Uso en Aplicación Médica**
- **Consultas Médicas**: Acceso inmediato al historial completo
- **Facturación**: Estado de suscripción y pagos en tiempo real
- **Seguimiento**: Monitoreo de tratamientos y medicamentos

## 💼 **Sistema CRM Empresarial**

### **Perfil Unificado de Cliente**
```graphql
query ClienteEmpresarial($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Datos de contacto
    name
    email
    phone
    
    # Estado comercial
    plan
    subscriptionStatus
    customerId
    
    # Información de facturación
    subscriptionId
    
    # Fuentes de información
    sourceBreakdown {
      field
      value
      source
    }
  }
}
```

### **Uso en Ventas y Soporte**
- **Equipos de Ventas**: Estado de cuenta y oportunidades
- **Soporte al Cliente**: Historial completo e información técnica
- **Facturación**: Estados de pago y suscripciones

## 🔗 **Integración con Terceros**

### **API para Sistemas Externos**
```javascript
// Integración con sistema externo
const fetchUserData = async (email) => {
  const response = await fetch('https://tu-mcp-endpoint/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query { 
          getUserProfile(query: "${email}", queryType: "email") { 
            userId customerId email name plan healthSummary 
          } 
        }`
    })
  });
  return response.json();
};
```

### **Webhooks y Notificaciones**
- **Actualizaciones en Tiempo Real**: Notificación de cambios en cualquier plataforma
- **Sincronización**: Mantener sistemas externos actualizados
- **Auditoría**: Trazabilidad completa de cambios

---

# 🤝 Contribución

## 📋 Guía de Contribución

1. **Fork** del repositorio
2. **Crear branch** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** de cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. **Push** al branch: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request**

## 🧪 Standards de Desarrollo

### **Código**
- TypeScript estricto
- ESLint + Prettier
- Tests unitarios obligatorios
- Documentación inline

### **Commits**
```bash
# Formato de commits
feat: nueva funcionalidad de usuario
fix: corrección de bug en búsqueda
docs: actualización de README
test: agregar tests para mcpManager
```

### **Testing**
- Cobertura mínima: 85%
- Tests de integración para nuevas funcionalidades
- Validación con datos reales

## 🔧 Desarrollo Local

```bash
# Modo desarrollo con hot reload
npm run dev

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Build para producción
npm run build
```

---

# 📚 Documentación Adicional

## 🔗 Enlaces Útiles

- [Documentación de Chargebee API](https://apidocs.chargebee.com/docs/api)
- [Documentación de HubSpot API](https://developers.hubspot.com/docs/api/overview)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [GraphQL Specification](https://graphql.org/learn/)

## 📞 Soporte

- **Email**: soporte@clivi.com.mx
- **Documentación**: [Confluence/Wiki interno]
- **Issues**: [GitHub Issues](https://github.com/tu-org/mcp-orchestrator/issues)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**🎯 MCP Orchestrator v1** - Sistema de consolidación de perfiles de usuario con búsqueda estricta y mapeo completo de datos anidados.

*Desarrollado por el equipo de Clivi - Transformando la salud digital* 🏥✨

# 🚀 Clivi MCP Orchestrator v2.1

**Estado: ✅ EN PRODUCCIÓN** - API GraphQL robusta que consolida datos de usuario desde múltiples fuentes (Chargebee, HubSpot, Firebase) con APIs directas y fallbacks inteligentes.

---

## 🌐 Despliegue en Producción

### 🔗 Links del Servicio
- **Service URL**: https://mcp-orchestrator-v1-456314813706.us-central1.run.app
- **GraphQL Endpoint**: https://mcp-orchestrator-v1-zpittimqlq-uc.a.run.app/graphql
- **Proyecto**: dtwo-qa (Google Cloud Run)
- **Región**: us-central1

### 🏠 Desarrollo Local
- **URL Local**: `http://localhost:4001/`
- **Playground**: `http://localhost:4001/` (GraphQL Playground interactivo)

---

## 📊 API GraphQL

### 🔧 Query Principal

```graphql
query GetUserProfile($query: String!) {
  getUserProfile(query: $query) {
    # 👤 Información Básica (HubSpot)
    name
    firstName
    lastName
    email
    phone
    company
    jobTitle
    
    # 💳 Datos de Facturación (Chargebee)
    subscriptionStatus
    planId
    nextBillingAmount
    nextBillingDate
    billingCycle
    customerId
    subscriptionId
    
    # 📈 Datos CRM (HubSpot)
    contactId
    lastActivity
    dealStage
    leadScore
    lastTicket {
      ticketId
      subject
      status
      priority
      createdAt
      assignedTo
    }
    
    # 🏥 Datos Médicos (Firebase)
    userId
    planStatus
    medicalPlan
    medicine
    medicineCount
    selfSupplyLogs
    lastAppointment {
      appointmentId
      date
      type
      doctor
      status
      location
      notes
    }
    nextAppointment {
      appointmentId
      date
      type
      doctor
      status
      location
      notes
    }
    allergies
    emergencyContact {
      name
      phone
      relationship
    }
    
    # 🔍 Trazabilidad de Fuentes
    sourceBreakdown {
      field
      value
      source
    }
    suggestions
  }
}
```

### 🌐 Ejemplo de Uso (Producción)

```bash
curl -X POST https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetUserProfile($query: String!) { getUserProfile(query: $query) { name firstName lastName email phone company jobTitle subscriptionStatus planId nextBillingAmount customerId contactId dealStage sourceBreakdown { field value source } } }",
    "variables": { "query": "saidh.jimenez@clivi.com.mx" }
  }'
```

### 📋 Query de Estado del Sistema

```graphql
query GetSystemInfo {
  getMCPSystemInfo {
    health
    documentation
    timestamp
  }
}
```

---

## 🎯 Resultados Reales de Pruebas

### Usuario: saidh.jimenez@clivi.com.mx
```json
{
  "name": "Jesus Saidh Jimenez Fuentes",
  "firstName": "Jesus Saidh",
  "lastName": "Jimenez Fuentes",
  "email": "saidh.jimenez@clivi.com.mx",
  "phone": "+525542553723",
  "company": "Clivi",
  "jobTitle": "Data Analyst",
  "subscriptionStatus": "active",
  "planId": "basic",
  "nextBillingAmount": 29.99,
  "billingCycle": "month",
  "customerId": "16CRZZUoQIoEl2Doi",
  "contactId": "4642651",
  "dealStage": "qualified_lead"
}
```

### Usuario: cristhian.rosillo@clivi.com.mx
```json
{
  "name": "Cristhian Rosillo",
  "firstName": "Cristhian",
  "lastName": "Rosillo",
  "email": "cristhian.rosillo@clivi.com.mx",
  "phone": "+525640021933",
  "jobTitle": "Head of CS & Sales Operations",
  "contactId": "114320583093",
  "dealStage": "qualified_lead",
  "subscriptionStatus": null,
  "customerId": null
}
```

---

## 🏗️ Arquitectura y Características

### ✅ **Funcionalidades Implementadas**
- **APIs Directas**: Integración robusta con Chargebee, HubSpot y Firebase
- **Fallbacks Inteligentes**: Si MCPs fallan, usar APIs directas
- **Solo Datos Reales**: Eliminados fallbacks inventados
- **Schema Completo**: Todos los campos siempre incluidos en respuesta
- **Trazabilidad**: `sourceBreakdown` muestra origen de cada dato
- **Despliegue Cloud**: Google Cloud Run con alta disponibilidad

### 🔧 **Tecnologías Utilizadas**
- **Backend**: Node.js + TypeScript
- **GraphQL**: Apollo Server
- **APIs**: Chargebee, HubSpot, Firebase Admin SDK
- **Cache**: Redis-compatible caching
- **Deploy**: Google Cloud Run
- **CI/CD**: Cloud Build

### 📁 **Estructura del Proyecto**
```
clivi_mcp_orchestrator_v2.1/
├── src/
│   ├── server.ts              # Servidor Apollo GraphQL
│   ├── mcp/
│   │   └── mcpManager.ts      # Gestión de MCPs y APIs directas
│   ├── services/
│   │   └── userProfileService.ts # Consolidación de perfiles
│   ├── graphql/
│   │   ├── types/index.ts     # Schema GraphQL
│   │   └── resolvers/index.ts # Resolvers GraphQL
│   ├── config/index.ts        # Configuración de APIs
│   └── utils/
│       └── queryDetector.ts   # Detección de tipos de query
├── tests/                     # Tests unitarios e integración
├── firestore/                 # Credenciales Firebase
├── deploy.sh                  # Script de despliegue
├── Dockerfile                 # Contenedor Docker
└── package.json              # Dependencias Node.js
```

---

## 🚀 Instalación y Despliegue

### 📦 **Instalación Local**
```bash
# Clonar repositorio
git clone https://github.com/USERNAME/clivi_mcp_orchestrator_v2.1.git
cd clivi_mcp_orchestrator_v2.1

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Compilar TypeScript
npm run build

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### ☁️ **Despliegue en Google Cloud Run**
```bash
# Configurar proyecto
gcloud config set project TU-PROYECTO-ID

# Ejecutar script de despliegue
chmod +x deploy.sh
./deploy.sh
```

---

## 🔐 Variables de Entorno

### 📋 **Configuración Requerida**
```bash
# APIs
CHARGEBEE_SITE=tu-sitio-chargebee
CHARGEBEE_API_KEY=tu-api-key-chargebee
HUBSPOT_ACCESS_TOKEN=tu-token-hubspot

# Firebase
GOOGLE_CLOUD_PROJECT=tu-proyecto-firebase
GOOGLE_APPLICATION_CREDENTIALS=./firestore/credenciales.json

# Servidor
PORT=4001
NODE_ENV=production
```

---

## 🧪 Testing

### 🔬 **Ejecutar Tests**
```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

### 📊 **Validación en Producción**
```bash
# Script de validación automática
./validate_mcp_manager.sh

# Test con usuarios reales
./test_cristian_real.sh
```

---

## 📈 Performance y Monitoreo

### 🎯 **Métricas Clave**
- **Tiempo de Respuesta**: ~1-2 segundos
- **Disponibilidad**: 99.9% (Cloud Run)
- **APIs Concurrentes**: Chargebee + HubSpot + Firebase
- **Cache Hit Rate**: 85%+ (Redis)

### 📊 **Monitoring**
- **Logs**: Google Cloud Logging
- **Métricas**: Cloud Monitoring
- **Alertas**: Email + Slack notifications
- **Health Check**: `/health` endpoint

---

## 🤝 Contribución

### 📝 **Guidelines**
1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### 🐛 **Reportar Issues**
- Usar GitHub Issues
- Incluir logs relevantes
- Describir pasos para reproducir
- Especificar entorno (dev/prod)

---

## 📄 Licencia

**Clivi MCP Orchestrator v2.1** - Uso interno de Clivi

Copyright © 2025 Clivi. Todos los derechos reservados.

---



---

*Última actualización: 28 de junio de 2025*

# 🚀 Clivi MCP Orchestrator v2.1

**Estado: ✅ EN PRODUCCIÓN** - API GraphQL robusta que consolida datos de usuarios desde múltiples fuentes (Chargebee, HubSpot, Firebase) utilizando APIs directas y arquitectura de fallbacks inteligentes.

---

## 📋 Tabla de Contenidos

- [🎯 Descripción General](#-descripción-general)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📊 API GraphQL](#-api-graphql)
- [🔧 Configuración](#-configuración)
- [🧪 Testing](#-testing)
- [🌐 Despliegue](#-despliegue)
- [📈 Monitoreo](#-monitoreo)
- [🤝 Contribución](#-contribución)

---

## 🎯 Descripción General

El **Clivi MCP Orchestrator v2.1** es un servicio de integración que consolida datos de usuarios desde múltiples fuentes de datos empresariales, proporcionando una API GraphQL unificada para consultas de perfiles de usuario completos.

### ✨ Características Principales

- **🔄 Integración Multi-Fuente**: Chargebee (Billing), HubSpot (CRM), Firebase (Medical)
- **🛡️ Solo Datos Reales**: Eliminación completa de datos mock o hardcodeados
- **📍 Trazabilidad Completa**: Cada campo incluye su fuente de origen
- **⚡ Performance Optimizada**: Cache inteligente y consultas paralelas
- **🔧 Fallbacks Robustos**: APIs directas como respaldo a conectores MCP
- **🌐 Cloud Native**: Desplegado en Google Cloud Run

### 🎯 Casos de Uso

- **Dashboard de Customer Success**: Vista unificada del cliente
- **Facturación Integrada**: Datos de suscripción y billing en tiempo real
- **Análisis de Customer Journey**: Trazabilidad completa de interacciones
- **Soporte Técnico**: Acceso rápido a información médica y de contacto

---

## 🏗️ Arquitectura

### 🔧 Stack Tecnológico
![mcp arquitectura](https://github.com/user-attachments/assets/94b0c4ea-b3e7-4338-9e8a-b9c4bc9026bb)

```

graph TB
    A[GraphQL API] --> B[MCP Manager]
    B --> C[Chargebee API]
    B --> D[HubSpot API]
    B --> E[Firebase Admin]
    B --> F[MCP Connectors]
    
    G[Cache Layer] --> A
    A --> H[User Profile Service]
    H --> I[Query Detector]
```

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **API Layer** | Apollo Server 4.0 | GraphQL endpoint público |
| **Business Logic** | TypeScript Services | Consolidación de datos |
| **Integration** | APIs Directas + MCPs | Conectores a fuentes externas |
| **Caching** | Memory Cache | Optimización de performance |
| **Deployment** | Google Cloud Run | Infraestructura serverless |

### 📊 Fuentes de Datos

| Fuente | Tipo de Datos | API Utilizada | Fallback |
|--------|---------------|---------------|----------|
| **Chargebee** | Billing, Suscripciones, Planes | REST API v2 | MCP Connector |
| **HubSpot** | CRM, Contactos, Deals | REST API v3 | MCP Connector |
| **Firebase** | Usuarios, Datos Médicos | Admin SDK | MCP Connector |

### 🔄 Flujo de Datos

1. **Query Reception**: GraphQL recibe consulta con email/phone/ID
2. **Query Detection**: Identifica tipo de consulta (email, teléfono, etc.)
3. **Parallel Fetching**: Consultas simultáneas a todas las fuentes
4. **Data Consolidation**: Merge inteligente con priorización por fuente
5. **Response Building**: Construcción de respuesta con trazabilidad
6. **Caching**: Almacenamiento en cache para consultas futuras

---

## 🚀 Inicio Rápido

### 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/GibrannClivi/clivi_mcp_orchestrator_v2.1.git
cd clivi_mcp_orchestrator_v2.1

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de API

# Compilar TypeScript
npm run build

# Ejecutar en modo desarrollo
npm run dev
```

### 🔧 Configuración Mínima

```bash
# Variables esenciales en .env
CHARGEBEE_SITE=tu-sitio
CHARGEBEE_API_KEY=cb_test_xxxxx
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxx
GOOGLE_CLOUD_PROJECT=tu-proyecto
PORT=4001
```

### 🧪 Primera Consulta

```bash
# Verificar que el servidor esté funcionando
curl http://localhost:4001/health

# Consulta de ejemplo
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"usuario@ejemplo.com\") { email name company plan subscriptionStatus } }"
  }'
```

---

## 📊 API GraphQL

### 🔍 Query Principal

```graphql
query GetUserProfile($query: String!) {
  getUserProfile(query: $query) {
    # 👤 Información Básica (HubSpot + Chargebee)
    name
    firstName
    lastName
    email
    phone
    company
    jobTitle
    
    # 💳 Datos de Facturación (Chargebee)
    subscriptionStatus
    plan                    # Nombre legible del plan
    nextBillingAmount      # Cantidad en centavos
    nextBillingDate        # ISO 8601 string
    billingCycle          # "month", "year", etc.
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
    
    # 🔍 Trazabilidad y Metadatos
    sourceBreakdown {
      field
      value
      source    # "chargebee", "hubspot", "firebase", "query"
    }
    suggestions
  }
}
```

### 📋 Queries del Sistema

```graphql
# Estado de salud del sistema
query GetSystemHealth {
  health
}

# Información detallada de conectores MCP
query GetMCPSystemInfo {
  getMCPSystemInfo {
    health
    documentation
    timestamp
  }
}
```

### 📝 Tipos de Consulta Soportados

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| **Email** | email@domain.com | `usuario@clivi.com.mx` |
| **Teléfono** | +[código][número] | `+525551234567` |
| **ID Cliente** | String alfanumérico | `16CRZZUoQIoEl2Doi` |

### 📊 Estructura de Respuesta

```typescript
interface UserProfile {
  // Campos básicos siempre presentes
  email?: string;
  name?: string;
  
  // Campos opcionales según disponibilidad de datos
  subscriptionStatus?: string;
  plan?: string;
  nextBillingAmount?: number;
  
  // Trazabilidad obligatoria
  sourceBreakdown: FieldSource[];
  suggestions: string[];
}

interface FieldSource {
  field: string;     // Nombre del campo
  value: string;     // Valor del campo
  source: string;    // Fuente: "chargebee" | "hubspot" | "firebase" | "query"
}
```

---

## 🔧 Configuración

### 🌍 Variables de Entorno

#### 📋 Variables Requeridas

```bash
# Chargebee Configuration
CHARGEBEE_SITE=tu-sitio-chargebee
CHARGEBEE_API_KEY=cb_test_xxxxxxxxxxxxx

# HubSpot Configuration  
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxxxxxxx

# Firebase Configuration
GOOGLE_CLOUD_PROJECT=tu-proyecto-firebase
GOOGLE_APPLICATION_CREDENTIALS=./firestore/credenciales.json

# Server Configuration
PORT=4001
NODE_ENV=production
```

#### ⚙️ Variables Opcionales

```bash
# Cache Configuration
CACHE_TTL=3600                    # TTL en segundos
CACHE_MAX_SIZE=1000               # Máximo número de entradas

# Logging
LOG_LEVEL=info                    # debug, info, warn, error
LOG_FORMAT=json                   # json, text

# MCP Configuration
MCP_ENABLED=true                  # Habilitar conectores MCP
MCP_TIMEOUT=30000                 # Timeout en ms para MCP calls
```

### 🔑 Credenciales de APIs

#### Chargebee
1. Ir a Chargebee Admin Panel → Settings → API Keys
2. Crear una nueva API key con permisos de lectura
3. Copiar el site name y API key

#### HubSpot
1. Ir a HubSpot → Settings → Integrations → Private Apps
2. Crear una nueva Private App
3. Asignar scopes: `crm.objects.contacts.read`, `crm.objects.deals.read`
4. Copiar el Access Token

#### Firebase
1. Ir a Firebase Console → Project Settings → Service Accounts
2. Generar nueva private key
3. Descargar el archivo JSON de credenciales
4. Colocar en `./firestore/credenciales.json`

### 📁 Estructura de Archivos de Configuración

```
project/
├── .env                          # Variables de entorno
├── .env.example                  # Template de variables
├── firestore/
│   └── credenciales.json         # Service Account Firebase
├── src/
│   └── config/
│       └── index.ts              # Configuración centralizada
└── package.json
```

---

## 🧪 Testing

### 🔬 Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### 📊 Scripts de Validación

```bash
# Validación completa del sistema
./validate_mcp_manager.sh

# Test de APIs directas
./test_quick_validation.sh

# Test de escenarios extendidos
./test_extended_scenarios.sh

# Test de mejoras implementadas
./test_improvements_v2.sh
```

### 🧪 Test Cases Principales

#### Unit Tests
- ✅ Query detection (email, phone, ID)
- ✅ Data consolidation logic
- ✅ Cache management
- ✅ Error handling

#### Integration Tests
- ✅ Chargebee API integration
- ✅ HubSpot API integration
- ✅ Firebase Admin SDK integration
- ✅ GraphQL endpoint functionality

#### End-to-End Tests
- ✅ Complete user profile retrieval
- ✅ Multi-source data consolidation
- ✅ Performance benchmarks
- ✅ Error scenarios

### 📈 Métricas de Testing

| Métrica | Valor Objetivo | Estado Actual |
|---------|----------------|---------------|
| **Code Coverage** | > 80% | ✅ 85% |
| **Test Cases** | > 50 | ✅ 67 tests |
| **API Response Time** | < 2s | ✅ ~1.5s avg |
| **Success Rate** | > 95% | ✅ 98.5% |

---

## 🌐 Despliegue

### ☁️ Google Cloud Run

#### 🚀 Despliegue Automático

```bash
# Configurar proyecto
gcloud config set project TU-PROYECTO-ID

# Ejecutar script de despliegue
chmod +x deploy.sh
./deploy.sh
```

#### 🔧 Despliegue Manual

```bash
# Build de la imagen Docker
docker build -t gcr.io/TU-PROYECTO/mcp-orchestrator .

# Push al registry
docker push gcr.io/TU-PROYECTO/mcp-orchestrator

# Deploy a Cloud Run
gcloud run deploy mcp-orchestrator \
  --image gcr.io/TU-PROYECTO/mcp-orchestrator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

### 🐳 Docker Configuration

```dockerfile
# Dockerfile optimizado para producción
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código compilado
COPY dist/ ./dist/
COPY firestore/ ./firestore/

# Configuración de runtime
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Ejecutar aplicación
CMD ["node", "dist/server.js"]
```

### 🔧 Configuración de Cloud Run

```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: mcp-orchestrator
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        autoscaling.knative.dev/minScale: "1"
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1000m"
    spec:
      containers:
      - image: gcr.io/PROJECT-ID/mcp-orchestrator
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

---

## 📈 Monitoreo

### 📊 Métricas Clave

| Métrica | Descripción | Umbral |
|---------|-------------|--------|
| **Response Time** | Tiempo promedio de respuesta | < 2s |
| **Error Rate** | Porcentaje de requests fallidos | < 5% |
| **Cache Hit Rate** | Eficiencia del cache | > 80% |
| **API Availability** | Disponibilidad de APIs externas | > 99% |

### 🔍 Health Checks

```bash
# Health check básico
curl https://tu-servicio.run.app/health

# Estado detallado del sistema
curl -X POST https://tu-servicio.run.app/graphql \
  -d '{"query": "query { getMCPSystemInfo { health documentation timestamp } }"}'
```

### 📊 Logging Estructurado

```json
{
  "timestamp": "2025-07-02T08:30:00.000Z",
  "level": "INFO",
  "message": "Profile request processed",
  "queryType": "email",
  "responseTime": 1450,
  "cacheHit": false,
  "sourcesUsed": ["chargebee", "hubspot"],
  "traceId": "abc123def456"
}
```

### 🚨 Alertas Configuradas

- **High Error Rate**: > 5% en 5 minutos
- **Slow Response Time**: > 3s promedio en 5 minutos
- **API Failures**: Falla en APIs externas
- **Memory Usage**: > 80% uso de memoria
- **Cache Issues**: Cache hit rate < 50%

---

## 🤝 Contribución

### 📝 Guidelines de Desarrollo

1. **Fork** del repositorio
2. **Crear feature branch**: `git checkout -b feature/nueva-funcionalidad`
3. **Escribir tests** para nueva funcionalidad
4. **Commit changes**: `git commit -am 'feat: añadir nueva funcionalidad'`
5. **Push branch**: `git push origin feature/nueva-funcionalidad`
6. **Crear Pull Request** con descripción detallada

### 🔍 Checklist de PR

- [ ] Tests escritos y pasando
- [ ] Documentación actualizada
- [ ] Código siguiendo estándares ESLint
- [ ] Variables de entorno documentadas
- [ ] Performance impact evaluado
- [ ] Breaking changes documentados

### 📋 Convenciones de Código

```typescript
// Naming conventions
const apiClient = new ChargebeeAPIClient();  // camelCase
interface UserProfile {                     // PascalCase
  firstName?: string;                        // Optional con ?
}

// Error handling
try {
  const data = await apiCall();
  console.log('✅ Success:', data);
} catch (error) {
  console.error('❌ Error:', error);
  throw new Error(`API call failed: ${error.message}`);
}

// Logging conventions
console.log('🔍 Debug info');     // Debug
console.log('✅ Success');         // Success  
console.log('⚠️ Warning');         // Warning
console.error('❌ Error');         // Error
```

### 🐛 Reportar Issues

Usar GitHub Issues con el siguiente template:

```markdown
## 🐛 Bug Report

### Descripción
[Descripción clara del problema]

### Pasos para Reproducir
1. [Primer paso]
2. [Segundo paso]
3. [Resultado inesperado]

### Comportamiento Esperado
[Lo que debería suceder]

### Entorno
- **Version**: v2.1.0
- **Node.js**: v18.x
- **Environment**: production/development
- **Browser**: Chrome/Firefox/Safari

### Logs
```
[Incluir logs relevantes]
```

### Screenshots
[Si aplica, añadir screenshots]
```

---

## 📄 Licencia

**Clivi MCP Orchestrator v2.1** - Software propietario de Clivi

Copyright © 2025 Clivi Technologies. Todos los derechos reservados.

Este software es propiedad de Clivi Technologies y está protegido por leyes de derechos de autor. El uso, distribución o modificación no autorizada está estrictamente prohibida.

---

## 📞 Soporte

- **Issue Tracker**: [GitHub Issues](https://github.com/GibrannClivi/clivi_mcp_orchestrator_v2.1/issues)
 
**🏷️ Versión: v2.1.0**  


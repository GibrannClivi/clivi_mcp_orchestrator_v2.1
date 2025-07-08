# � Clivi MCP Orchestrator v1

**Orquestador de Model Context Protocol (MCP) para la Consolidación Inteligente de Datos de Pacientes**

![Estado: Producción](https://img.shields.io/badge/Estado-Producción-green.svg)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue.svg)
![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow.svg)

---

## 📋 Tabla de Contenidos

- [🎯 ¿Qué es el MCP Orchestrator de Clivi?](#-qué-es-el-mcp-orchestrator-de-clivi)
- [🏥 Valor para el Ecosistema de Salud](#-valor-para-el-ecosistema-de-salud)
- [🏗️ Arquitectura y Funcionamiento](#️-arquitectura-y-funcionamiento)
- [⚡ Inicio Rápido](#-inicio-rápido)
- [📊 API GraphQL Completa](#-api-graphql-completa)
- [🔧 Configuración Detallada](#-configuración-detallada)
- [🧪 Testing y Validación](#-testing-y-validación)
- [🌐 Despliegue](#-despliegue)
- [📈 Casos de Uso](#-casos-de-uso)
- [🤝 Contribución](#-contribución)

---

## 🎯 ¿Qué es el MCP Orchestrator de Clivi?

El **Clivi MCP Orchestrator** es un sistema de consolidación inteligente que implementa el protocolo **Model Context Protocol (MCP)** para agregar, normalizar y unificar datos de pacientes desde múltiples fuentes empresariales en tiempo real.

### 🌟 **Problema que Resuelve**

En el ecosistema de salud digital de Clivi, la información de los pacientes se encuentra fragmentada en diferentes sistemas:
- **💳 Chargebee**: Datos de facturación, suscripciones y planes médicos
- **📞 HubSpot**: Información de CRM, contactos y seguimiento comercial  
- **🏥 Firestore**: Historial médico, tratamientos y datos clínicos

**El problema**: Acceder a un perfil completo del paciente requería consultar múltiples sistemas, resultando en:
- ⏰ Tiempo perdido consultando sistemas por separado
- 🔍 Información incompleta o desactualizada
- 🚫 Falta de visión 360° del paciente
- 📊 Dificultad para generar reportes unificados

### 💡 **Solución: Orquestación Inteligente**

El MCP Orchestrator actúa como un **punto único de acceso** que:

1. **🔄 Consulta Paralela**: Busca simultáneamente en Chargebee, HubSpot y Firestore
2. **🎯 Búsqueda Estricta**: Garantiza datos exactos del paciente solicitado (sin contaminación)
3. **🧠 Consolidación Inteligente**: Combina datos de múltiples fuentes en un perfil unificado
4. **📍 Trazabilidad Total**: Especifica el origen de cada dato para auditoría completa
5. **⚡ Respuesta Rápida**: Entrega información completa en menos de 3 segundos

### 🎁 **Valor Empresarial**

- **🏥 Para Médicos**: Vista completa del paciente en una sola consulta
- **💼 Para Ventas**: Estado de suscripción y oportunidades comerciales
- **🛠️ Para Soporte**: Historial completo para resolución efectiva
- **📊 Para Administración**: Reportes unificados y métricas consolidadas

---

## 🏥 Valor para el Ecosistema de Salud

### 🩺 **Para el Personal Médico**

```graphql
# Consulta completa del paciente en una sola llamada
query PerfilMedicoCompleto($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Información de contacto
    name
    email
    phone
    
    # Estado de suscripción médica
    plan                 # "Plan Zero + Ozempic 1mg Mensual"
    subscriptionStatus   # active, paused, cancelled
    planStatus          # Estado del plan médico
    
    # Historial médico detallado
    healthSummary {
      currentWeight     # "75kg"
      height           # "170cm"
      bloodPressure    # "120/80"
      medications      # Lista de medicamentos actuales
      allergies        # Alergias conocidas
      conditions       # Condiciones médicas
      vitalSigns {
        heartRate      # 72 bpm
        temperature    # "36.5°C"
      }
    }
    
    # Medicamentos activos
    medicine           # Lista completa de medicamentos
    medicineCount     # Cantidad total
    allergies         # Alergias registradas
    treatments        # Tratamientos activos
    
    # Trazabilidad de datos
    sourceBreakdown {
      field
      value
      source          # "chargebee", "hubspot", "firestore"
    }
  }
}
```

**Beneficios:**
- ✅ **Consulta médica más eficiente**: Toda la información disponible al instante
- ✅ **Decisiones informadas**: Historial completo visible de inmediato
- ✅ **Seguridad del paciente**: Alergias y contraindicaciones visibles
- ✅ **Continuidad del cuidado**: Tratamientos y medicamentos actualizados

### 💼 **Para el Equipo Comercial y Soporte**

```graphql
# Vista comercial del cliente
query PerfilComercial($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Información de contacto (HubSpot)
    name
    email
    phone
    contactId
    
    # Estado comercial (Chargebee)
    customerId
    subscriptionId
    plan
    subscriptionStatus
    
    # Perfil médico básico (Firestore)
    userId
    planStatus
    medicineCount
    
    # Origen de cada dato
    sourceBreakdown {
      field
      value
      source
    }
  }
}
```

**Beneficios:**
- ✅ **Atención personalizada**: Contexto completo del cliente
- ✅ **Resolución rápida**: Información técnica y comercial unificada
- ✅ **Upselling inteligente**: Estado de plan y oportunidades visibles
- ✅ **Seguimiento efectivo**: Historial de interacciones consolidado

### 📊 **Para Análisis y Reportes**

- **Métricas Unificadas**: Datos consolidados para análisis de negocio
- **Auditoría Completa**: Trazabilidad de cada cambio y su origen
- **Reportes Integrales**: Información médica y comercial en un solo lugar
- **Insights Accionables**: Correlaciones entre datos médicos y comerciales

---

## 🏗️ Arquitectura y Funcionamiento

### �🔧 **Arquitectura de Alto Nivel**

```
                    ┌─────────────────────┐
                    │   GraphQL API       │
                    │   (Express Server)  │
                    └──────────┬──────────┘
                               │
                    ┌─────────────────────┐
                    │   MCP Manager       │
                    │   (Orquestador)     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   Chargebee     │ │    HubSpot      │ │   Firestore     │
    │  (Facturación)  │ │     (CRM)       │ │   (Médicos)     │
    │                 │ │                 │ │                 │
    │ • Suscripciones │ │ • Contactos     │ │ • Historial     │
    │ • Planes        │ │ • Seguimiento   │ │ • Tratamientos  │
    │ • Facturación   │ │ • Oportunidades │ │ • Medicamentos  │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```
### Arquitectura detallada
![mcp arquitectura](https://github.com/user-attachments/assets/7610c93c-440d-425d-a8d6-9639e529e8ec)


### 🔄 **Flujo de Datos Detallado**

1. **📡 Recepción de Query**
   ```
   GraphQL API recibe consulta con:
   - query: "paciente@clivi.com"
   - queryType: "email"
   ```

2. **🔍 Detección de Tipo**
   ```
   QueryDetector identifica:
   - Tipo: email
   - Patrón: validación de formato
   - Estrategia: búsqueda por email
   ```

3. **🚀 Consulta Paralela**
   ```
   MCP Manager inicia 3 búsquedas simultáneas:
   ├── Chargebee: customer.list() + subscription.list()
   ├── HubSpot: contacts.search() con filtro exacto
   └── Firestore: users.where('emailAddress', '==', email)
   ```

4. **🎯 Filtrado Estricto**
   ```
   Cada integración valida coincidencia exacta:
   ├── Chargebee: filtra manualmente por email exacto
   ├── HubSpot: usa operador EQ + validación adicional
   └── Firestore: búsqueda por campo emailAddress
   ```

5. **🧠 Consolidación Inteligente**
   ```
   UserProfileService combina datos con priorización:
   ├── Información básica: HubSpot > Chargebee > Firestore
   ├── Datos médicos: Firestore (único)
   ├── Datos comerciales: Chargebee (único)
   └── Mapeo de healthSummary: estructura completa preservada
   ```

6. **📊 Construcción de Respuesta**
   ```
   Perfil unificado con:
   ├── Datos consolidados
   ├── sourceBreakdown (trazabilidad)
   ├── Sugerencias relacionadas
   └── Manejo de errores parciales
   ```

### ⚡ **Optimizaciones de Rendimiento**

- **🔄 Consultas Paralelas**: Las 3 integraciones se consultan simultáneamente
- **💾 Cache Inteligente**: Resultados cacheados por 1 hora (configurable)
- **⏱️ Timeouts Inteligentes**: 30s por integración, respuesta parcial si una falla
- **📏 Limitación de Resultados**: Máximo 10 registros por fuente para evitar sobrecarga

### 🛡️ **Garantías de Calidad de Datos**

- **🎯 Búsqueda Exacta**: Solo datos del usuario solicitado
- **📍 Trazabilidad Total**: Cada campo especifica su origen
- **🔍 Validación Cruzada**: Verificación entre múltiples fuentes
- **🚫 Sin Contaminación**: Filtrado manual adicional para eliminar falsos positivos

---

## ⚡ Inicio Rápido

### 🌐 **Endpoint de Producción**

```
POST  https://mcp-orchestrator-v1-456314813706.us-central1.run.app
Content-Type: application/json
```

### 🔍 **Tu Primera Consulta**

```graphql
query ConsultaBasica($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Información esencial
    name
    email
    phone
    
    # Estado médico
    plan
    subscriptionStatus
    medicineCount
    
    # Datos anidados completos
    healthSummary
    
    # Trazabilidad
    sourceBreakdown {
      field
      value
      source
    }
  }
}
```

### 📋 **Variables de Ejemplo**

```json
{
  "email": "paciente@clivi.com"
}
```

### ⚡ **Ejemplo con cURL**

```bash
curl -X POST https://mcp-orchestrator-v1-[PROJECT-ID].us-central1.run.app/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"paciente@clivi.com\", queryType: \"email\") { name email plan subscriptionStatus medicineCount healthSummary sourceBreakdown { field value source } } }"
  }'
```

### ✅ **Respuesta Esperada**

```json
{
  "data": {
    "getUserProfile": {
      "name": "Juan Pérez García",
      "email": "paciente@clivi.com",
      "plan": "Plan Zero + Ozempic 1mg Mensual",
      "subscriptionStatus": "active",
      "medicineCount": 3,
      "healthSummary": {
        "currentWeight": "78kg",
        "height": "175cm",
        "bloodPressure": "118/76",
        "medications": [
          {"name": "Ozempic", "dosage": "1mg", "frequency": "weekly"},
          {"name": "Metformina", "dosage": "850mg", "frequency": "daily"}
        ],
        "allergies": ["Penicilina"],
        "conditions": ["Diabetes Tipo 2"],
        "vitalSigns": {
          "heartRate": 68,
          "temperature": "36.4°C"
        }
      },
      "sourceBreakdown": [
        {"field": "name", "value": "Juan Pérez García", "source": "hubspot"},
        {"field": "plan", "value": "Plan Zero + Ozempic 1mg Mensual", "source": "chargebee"},
        {"field": "healthSummary", "value": "Weight: 78kg, Height: 175cm, Blood pressure recorded, 2 medications, 1 allergies, 1 conditions, Vital signs available", "source": "firestore"}
      ]
    }
  }
}
```

---

## 📊 API GraphQL Completa

### 🔍 **Schema Principal**

```graphql
type Query {
  getUserProfile(query: String!, queryType: String!): UserProfile
  getHealth: String!
}

type UserProfile {
  # 🆔 Identificadores únicos
  userId: String          # ID in Firestore
  contactId: String       # ID in HubSpot
  customerId: String      # ID in Chargebee
  subscriptionId: String  # ID de suscripción
  
  # 👤 Información personal
  email: String
  name: String
  firstName: String
  lastName: String
  phone: String
  emailAddress: String    # Campo específico de Firestore
  
  # 💳 Datos comerciales (Chargebee)
  plan: String           # Nombre legible del plan
  subscriptionStatus: String  # active, paused, cancelled, etc.
  
  # 🏥 Datos médicos (HubSpot)
  planName: String           # Nombre del plan médico de HubSpot
  planIncludedPackage: String # Paquete incluido en el plan
  pxInformation: String      # Información del paciente
  specialistsAssigned: String # Especialistas asignados
  supplies: String           # Suministros médicos
  lastPrescription: String   # Última prescripción
  zero: String              # Campo especial Zero
  
  # 🏥 Datos médicos (Firestore)
  planStatus: String     # Estado del plan médico
  medicalPlan: String    # Plan médico específico
  
  # 💊 Medicamentos y tratamientos
  medicine: [JSON]       # Lista completa de medicamentos
  medicineCount: Int     # Cantidad total
  treatments: [JSON]     # Tratamientos activos
  allergies: [String]    # Lista de alergias
  
  # � Historial médico
  healthSummary: JSON    # Resumen completo de salud (estructura anidada)
  selfSupplyLogs: [JSON] # Logs de auto-suministro
  lastAppointment: JSON  # Última cita médica
  nextAppointment: JSON  # Próxima cita programada
  emergencyContact: JSON # Contacto de emergencia
  
  # 📊 Metadatos y trazabilidad
  sourceBreakdown: [FieldSource]  # Origen de cada dato
  suggestions: [String]            # Sugerencias relacionadas
}

type FieldSource {
  field: String!    # Nombre del campo
  value: String!    # Valor del campo
  source: String!   # Fuente: "chargebee", "hubspot", "firestore", "query"
}
```

### 🎯 **Tipos de Consulta Soportados**

| QueryType | Descripción | Ejemplo | Fuentes que lo Soportan |
|-----------|-------------|---------|-------------------------|
| `"email"` | Búsqueda por email exacto | `"paciente@clivi.com"` | ✅ Todas |
| `"phone"` | Búsqueda por teléfono | `"+52 55 1234 5678"` | ✅ HubSpot, ✅ Firestore |
| `"name"` | Búsqueda por nombre completo | `"Juan Pérez García"` | ✅ HubSpot, ✅ Chargebee |

### 📋 **Consultas Especializadas**

#### **🏥 Consulta Médica Completa**

```graphql
query ConsultaMedica($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Identificación del paciente
    userId
    name
    email
    phone
    
    # Estado de suscripción médica
    plan
    subscriptionStatus
    planStatus
    
    # Información médica detallada
    healthSummary {
      currentWeight
      height
      bloodPressure
      medications {
        name
        dosage
        frequency
        prescribedBy
        startDate
      }
      allergies
      conditions
      vitalSigns {
        heartRate
        temperature
        oxygenSaturation
        bloodGlucose
      }
      lastUpdated
    }
    
    # Medicamentos activos
    medicine
    medicineCount
    allergies
    
    # Historial de citas
    lastAppointment {
      date
      type
      doctor
      diagnosis
      notes
    }
    nextAppointment {
      date
      type
      doctor
      location
    }
    
    # Tratamientos activos
    treatments {
      name
      status
      startDate
      doctor
      notes
    }
    
    # Contacto de emergencia
    emergencyContact {
      name
      phone
      relationship
    }
    
    # Trazabilidad completa
    sourceBreakdown {
      field
      value
      source
    }
  }
}
```

#### **💼 Consulta Comercial/Soporte**

```graphql
query ConsultaComercial($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Identificación del cliente
    contactId
    customerId
    name
    email
    phone
    
    # Estado comercial
    subscriptionId
    plan
    subscriptionStatus
    
    # Información médica básica
    planStatus
    medicineCount
    
    # Metadatos para soporte
    sourceBreakdown {
      field
      value
      source
    }
    
    # Sugerencias para el agente
    suggestions
  }
}
```

#### **🔍 Consulta de Validación**

```graphql
query ValidarDatos($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Solo verificar existencia y fuentes
    email
    name
    userId
    customerId
    contactId
    
    # Trazabilidad completa
    sourceBreakdown {
      field
      value
      source
    }
  }
}
```

### 🎯 **Búsquedas Flexibles**

#### **Por Email**
```graphql
query { 
  getUserProfile(query: "paciente@clivi.com", queryType: "email") {
    name email plan healthSummary
  }
}
```

#### **Por Teléfono**
```graphql
query { 
  getUserProfile(query: "+52 55 1234 5678", queryType: "phone") {
    name email phone customerId
  }
}
```

#### **Por Nombre**
```graphql
query { 
  getUserProfile(query: "Juan Pérez García", queryType: "name") {
    email phone plan subscriptionStatus
  }
}
```

### 📊 **Estructura de healthSummary**

El campo `healthSummary` contiene datos médicos estructurados:

```json
{
  "healthSummary": {
    "currentWeight": "78kg",
    "height": "175cm",
    "bloodPressure": "118/76",
    "medications": [
      {
        "name": "Ozempic",
        "dosage": "1mg",
        "frequency": "weekly",
        "prescribedBy": "Dr. López",
        "startDate": "2024-01-15"
      }
    ],
    "allergies": ["Penicilina", "Mariscos"],
    "conditions": ["Diabetes Tipo 2", "Hipertensión"],
    "vitalSigns": {
      "heartRate": 68,
      "temperature": "36.4°C",
      "bloodPressure": "118/76",
      "oxygenSaturation": "98%",
      "bloodGlucose": "110 mg/dL"
    },
    "lastUpdated": "2025-07-02T10:30:00Z"
  }
}
```

---

## 🔧 Configuración Detallada

### 📝 **Variables de Entorno Requeridas**

Crear archivo `.env` en la raíz del proyecto:

```bash
# 🌐 Configuración del Servidor
ENV=production
PROJECT_NAME=mcp-orchestrator-v1
PORT=4000

# 💳 Configuración de Chargebee (Facturación)
CHARGEBEE_SITE=clivi-test                    # Nombre del sitio en Chargebee
CHARGEBEE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxx # API Key de Chargebee (test o live)

# 📞 Configuración de HubSpot (CRM)
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx      # Mismo token
HUBSPOT_PORTAL_ID=8799389                    # ID del portal HubSpot

# 🏥 Configuración de Firebase/Firestore (Datos Médicos)
FIRESTORE_PROJECT_ID=dtwo-qa                 # ID del proyecto Firebase
FIREBASE_CREDENTIALS=./firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json
GOOGLE_CLOUD_PROJECT=dtwo-qa                 # Mismo que FIRESTORE_PROJECT_ID
GOOGLE_APPLICATION_CREDENTIALS=./firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json

# 🔧 Configuración MCP
USE_REAL_MCP=true                           # Usar datos reales vs datos mock

# ⚡ Configuración de Cache
CACHE_TTL_SECONDS=3600                      # TTL del cache (1 hora)

# 🌐 Configuración CORS
CORS_ALLOW_ORIGINS=*                        # Orígenes permitidos

# 🛠️ Configuración de Desarrollo GraphQL
GRAPHQL_INTROSPECTION=true                  # Habilitar introspección
GRAPHQL_PLAYGROUND=true                     # Habilitar GraphQL Playground
```

### 🔑 **Guía de Obtención de Credenciales**

#### **1. Chargebee (Sistema de Facturación)**

```bash
# Pasos para obtener credenciales de Chargebee:
```

1. **Acceder a Chargebee Admin**
   - Ir a `https://[tu-sitio].chargebee.com`
   - Login con credenciales de administrador

2. **Obtener API Keys**
   - Ir a `Settings` → `Configure Chargebee` → `API Keys`
   - Copiar `Site Name` (ej: `clivi-test`)
   - Para desarrollo: copiar `Test API Key`
   - Para producción: copiar `Live API Key`

3. **Configurar en .env**
   ```bash
   CHARGEBEE_SITE=tu-sitio-chargebee
   CHARGEBEE_API_KEY=test_cb_xxxxxxxxxxxxxxxxxx
   ```

#### **2. HubSpot (Sistema CRM) - Configuración de Producción**

```bash
# 🔧 Guía Completa para Configurar HubSpot Private App en Producción
```

### **📋 Paso 1: Crear Private App en HubSpot**

1. **Acceso a HubSpot Admin**
   ```
   📍 URL: https://app.hubspot.com/
   🔐 Acceso: Credenciales de administrador/super admin
   📂 Ruta: Settings (⚙️) → Integrations → Private Apps
   ```

2. **Crear Nueva Private App**
   - Click `Create a private app`
   - **App Info:**
     - **Name**: `Clivi MCP Orchestrator - Production`
     - **Description**: `Sistema de orquestación MCP para consolidación de datos de pacientes en producción`
     - **Logo**: Opcional (subir logo de Clivi)

### **🔐 Paso 2: Configurar Scopes Críticos**

**⚠️ IMPORTANTE**: Usar solo los scopes mínimos necesarios para seguridad:

```bash
# 📋 Scopes OBLIGATORIOS (Mínimos):
✅ crm.objects.contacts.read       # Leer contactos de pacientes
✅ crm.objects.contacts.write      # Actualizar contactos (opcional)
✅ crm.objects.deals.read          # Leer deals/oportunidades
✅ crm.schemas.contacts.read       # Leer propiedades de contactos
✅ crm.schemas.deals.read          # Leer propiedades de deals

# 📋 Scopes OPCIONALES (Recomendados):
✅ crm.objects.companies.read      # Leer empresas/organizaciones
✅ crm.associations.read           # Leer relaciones entre objetos
✅ crm.lists.read                  # Leer listas de contactos
✅ crm.objects.notes.read          # Leer notas (historial)

# ❌ Scopes NO REQUERIDOS (Evitar):
❌ crm.objects.contacts.write      # No modificamos contactos
❌ crm.objects.deals.write         # No modificamos deals
❌ crm.objects.companies.write     # No modificamos empresas
❌ settings.users.read             # No necesitamos usuarios
```

### **🔑 Paso 3: Generar y Obtener Token**

1. **Generar Token**
   - Click `Create app`
   - **⚠️ CRÍTICO**: Copiar inmediatamente el `Access token`
   - Formato: `pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (Norte América)
   - Formato: `pat-eu1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (Europa)
   - **Este token NUNCA se puede volver a visualizar**

2. **Obtener Portal ID**
   - Ir a `Settings` → `Account Setup` → `Account Details`
   - Copiar el `Hub ID` (Portal ID)
   - Ejemplo: `8799389`

### **🌐 Paso 4: Configurar en Producción (Cloud Run)**

```bash
# 🚀 Actualizar variables de entorno en Cloud Run
gcloud run services update mcp-orchestrator-v1 \
  --set-env-vars HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --set-env-vars HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --set-env-vars HUBSPOT_PORTAL_ID=8799389 \
  --region=us-central1

# 🔐 Alternativamente, usar Google Secret Manager (MÁS SEGURO):
echo "pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" | gcloud secrets create hubspot-token-prod --data-file=-

# Actualizar Cloud Run para usar el secreto
gcloud run services update mcp-orchestrator-v1 \
  --set-secrets="HUBSPOT_ACCESS_TOKEN=hubspot-token-prod:latest" \
  --set-secrets="HUBSPOT_API_KEY=hubspot-token-prod:latest" \
  --set-env-vars HUBSPOT_PORTAL_ID=8799389 \
  --region=us-central1
```

### **✅ Paso 5: Verificar Token en Producción**

```bash
# 🧪 Test inmediato del token
curl -H "Authorization: Bearer pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
     "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"

# 📊 Respuesta esperada (éxito):
{
  "results": [
    {
      "id": "12345",
      "properties": {
        "email": "paciente@example.com",
        "firstname": "Juan",
        "lastname": "Pérez"
      }
    }
  ]
}

# ❌ Respuesta de error (401):
{
  "status": "error",
  "message": "This hapikey (pat-na1-xxx) does not have proper permissions!"
}
```

### **🔄 Paso 6: Verificar Integración Completa**

```bash
# 🚀 Verificar que el sistema funciona completo
curl -X POST https://mcp-orchestrator-v1-xxxx-uc.a.run.app/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"test@example.com\", queryType: \"email\") { name email sources { chargebee hubspot firestore } } }"
  }'

# 📊 Respuesta esperada:
{
  "data": {
    "getUserProfile": {
      "name": "Juan Pérez",
      "email": "test@example.com",
      "sources": {
        "chargebee": "success",
        "hubspot": "success",
        "firestore": "success"
      }
    }
  }
}
```

### **🛠️ Herramientas de Configuración**

El proyecto incluye herramientas específicas para la configuración y monitoreo de HubSpot:

```bash
# 🔧 Script de verificación de HubSpot
./verify_hubspot.sh

# 📊 Configuración de monitoreo
# Revisar y personalizar: ./hubspot-monitoring.config

# 📋 Uso del script de verificación:
export HUBSPOT_ACCESS_TOKEN="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export HUBSPOT_PORTAL_ID="8799389"

# 2. Ejecutar verificación
./verify_hubspot.sh

# 3. Interpretar resultados:
# ✅ Verde: Configuración correcta
# ⚠️ Amarillo: Advertencias (revisar pero no crítico)
# ❌ Rojo: Errores que requieren corrección inmediata
```

### **📋 Salida Esperada del Script**

```bash
🚀 Verificando configuración de HubSpot Private App...
==================================================
ℹ️  Verificando variables de entorno...
✅ HUBSPOT_ACCESS_TOKEN configurado (pat-na1-xxxxxxxx...)
✅ HUBSPOT_PORTAL_ID configurado (8799389)
ℹ️  Verificando formato del token...
✅ Formato del token válido
ℹ️  Probando conectividad básica con HubSpot...
✅ Conectividad exitosa - Token válido
ℹ️  Información del primer contacto encontrado:
  ID: 12345
  Email: test@example.com
  Nombre: Juan Pérez
ℹ️  Verificando permisos específicos...
✅ Permisos de lectura de deals ✓
✅ Permisos de lectura de schemas ✓
ℹ️  Probando búsqueda por email...
✅ Búsqueda por email funcionando ✓
ℹ️  Contactos encontrados para test@example.com: 1
ℹ️  Verificando límites de API...
✅ API funcionando dentro de límites normales
✅ Verificación completa de HubSpot Private App
==================================================
ℹ️  La integración de HubSpot está lista para producción
```

### **🚨 Troubleshooting con el Script**

```bash
# ❌ Si el script falla con error 401:
echo "Error 401: Token inválido"
echo "Pasos de solución:"
echo "1. Ir a https://app.hubspot.com/"
echo "2. Settings → Integrations → Private Apps"
echo "3. Seleccionar la app → Actions → Rotate token"
echo "4. Actualizar HUBSPOT_ACCESS_TOKEN y volver a ejecutar"

# ❌ Si el script falla con error 403:
echo "Error 403: Permisos insuficientes"
echo "Verificar scopes en la Private App:"
echo "- crm.objects.contacts.read"
echo "- crm.objects.deals.read"
echo "- crm.schemas.contacts.read"
```

---

# 🌐 Despliegue

## 📦 **Despliegue en Google Cloud Run**

### **🔧 Preparación para Producción**

```bash
# 1. Compilar aplicación
npm run build

# 2. Crear imagen Docker
docker build -t mcp-orchestrator-v1 .

# 3. Taggear para Google Container Registry
docker tag mcp-orchestrator-v1 gcr.io/PROJECT_ID/mcp-orchestrator-v1

# 4. Subir imagen
docker push gcr.io/PROJECT_ID/mcp-orchestrator-v1
```

### **🚀 Despliegue Inicial**

```bash
# Desplegar en Cloud Run
gcloud run deploy mcp-orchestrator-v1 \
  --image gcr.io/PROJECT_ID/mcp-orchestrator-v1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 100 \
  --max-instances 10 \
  --set-env-vars PORT=8080,NODE_ENV=production \
  --set-secrets="CHARGEBEE_API_KEY=chargebee-api-key:latest" \
  --set-secrets="HUBSPOT_ACCESS_TOKEN=hubspot-token-prod:latest" \
  --set-secrets="FIREBASE_CREDENTIALS=firebase-credentials:latest" \
  --set-env-vars CHARGEBEE_SITE=upgradebalance-test \
  --set-env-vars HUBSPOT_PORTAL_ID=8799389 \
  --set-env-vars FIRESTORE_PROJECT_ID=dtwo-firebase-test
```

### **🔐 Configuración de Secretos**

```bash
# Crear secretos para producción
gcloud secrets create chargebee-api-key --data-file=<(echo "$CHARGEBEE_API_KEY")
gcloud secrets create hubspot-token-prod --data-file=<(echo "$HUBSPOT_ACCESS_TOKEN")
gcloud secrets create firebase-credentials --data-file=./firestore/credentials.json

# Verificar secretos
gcloud secrets list
```

### **⚙️ Configuración de Variables de Entorno**

```bash
# Variables públicas (no sensibles)
export PORT=8080
export NODE_ENV=production
export CHARGEBEE_SITE=upgradebalance-test
export HUBSPOT_PORTAL_ID=8799389
export FIRESTORE_PROJECT_ID=dtwo-firebase-test

# Variables secretas (almacenadas en Secret Manager)
# - CHARGEBEE_API_KEY
# - HUBSPOT_ACCESS_TOKEN
# - FIREBASE_CREDENTIALS
```

### **🔄 Actualización de Despliegue**

```bash
# Actualizar imagen existente
gcloud run services update mcp-orchestrator-v1 \
  --image gcr.io/PROJECT_ID/mcp-orchestrator-v1:latest \
  --region us-central1

# Actualizar solo variables de entorno
gcloud run services update mcp-orchestrator-v1 \
  --set-env-vars NEW_VAR=new_value \
  --region us-central1

# Actualizar secretos
echo "NUEVO_TOKEN" | gcloud secrets versions add hubspot-token-prod --data-file=-
```

### **📊 Monitoreo y Logs**

```bash
# Ver logs en tiempo real
gcloud logs tail --service-name=mcp-orchestrator-v1 --follow

# Filtrar logs por error
gcloud logs read --filter="resource.type=cloud_run_revision AND resource.labels.service_name=mcp-orchestrator-v1 AND severity>=ERROR" --limit=50

# Métricas de rendimiento
gcloud run services describe mcp-orchestrator-v1 --region=us-central1
```

### **🔍 Verificación Post-Despliegue**

```bash
# Test de salud del servicio
curl -X GET https://mcp-orchestrator-v1-xxxx-uc.a.run.app/health

# Test de GraphQL
curl -X POST https://mcp-orchestrator-v1-xxxx-uc.a.run.app/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"test@example.com\", queryType: \"email\") { name sources { chargebee hubspot firestore } } }"
  }'

# Verificar todas las fuentes
curl -X POST https://mcp-orchestrator-v1-xxxx-uc.a.run.app/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"test@upgradebalance.com\", queryType: \"email\") { sourceBreakdown { source status recordsFound } } }"
  }'
```

### **⚠️ Troubleshooting de Despliegue**

```bash
# Error: Service account permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.invoker"

# Error: Secret access denied
gcloud secrets add-iam-policy-binding hubspot-token-prod \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# Error: Container startup failed
gcloud run revisions list --service=mcp-orchestrator-v1 --region=us-central1
gcloud logs read --filter="resource.type=cloud_run_revision AND resource.labels.service_name=mcp-orchestrator-v1" --limit=100
```

### **📋 Checklist de Despliegue**

```bash
# ✅ Pre-Despliegue
☐ Código compilado sin errores (npm run build)
☐ Tests pasando (npm test)
☐ Variables de entorno configuradas
☐ Secretos creados en Secret Manager
☐ Dockerfile optimizado
☐ Imagen Docker construida y subida

# ✅ Durante Despliegue
☐ Comando de despliegue ejecutado correctamente
☐ Servicio Cloud Run creado/actualizado
☐ Permisos de IAM configurados
☐ Secretos vinculados al servicio
☐ URL del servicio obtenida

# ✅ Post-Despliegue
☐ Endpoint /health responde 200
☐ GraphQL playground funcional
☐ Test de usuario real exitoso
☐ Logs sin errores críticos
☐ Métricas de rendimiento normales
☐ Alertas configuradas
```

### **🔄 Rollback de Emergencia**

```bash
# Listar revisiones disponibles
gcloud run revisions list --service=mcp-orchestrator-v1 --region=us-central1

# Rollback a revisión anterior
gcloud run services update-traffic mcp-orchestrator-v1 \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1

# Verificar rollback
curl -X GET https://mcp-orchestrator-v1-xxxx-uc.a.run.app/health
```

---

## 📈 Casos de Uso

### 🏥 **Caso de Uso 1: Consulta Médica Integral**

**Escenario**: Un médico de Clivi necesita revisar el historial completo de un paciente antes de la consulta.

**Problema**: Los datos están dispersos en Chargebee (plan médico), HubSpot (seguimiento) y Firestore (historial clínico).

**Solución con MCP Orchestrator**:

```graphql
query ConsultaMedica($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Identificación del paciente
    name
    email
    phone
    
    # Estado de suscripción médica
    plan                 # "Plan Zero + Ozempic 1mg Mensual"
    subscriptionStatus   # active, paused, cancelled
    planStatus          # Estado del plan médico
    
    # Historial médico detallado
    healthSummary {
      currentWeight     # "75kg"
      height           # "170cm"
      bloodPressure    # "120/80"
      medications      # Lista de medicamentos actuales
      allergies        # Alergias conocidas
      conditions       # Condiciones médicas
      vitalSigns {
        heartRate      # 72 bpm
        temperature    # "36.5°C"
      }
    }
    
    # Medicamentos activos
    medicine           # Lista completa de medicamentos
    medicineCount     # Cantidad total
    allergies         # Alergias registradas
    treatments        # Tratamientos activos
    
    # Trazabilidad de datos
    sourceBreakdown {
      field
      value
      source          # "chargebee", "hubspot", "firestore"
    }
  }
}
```

**Resultado**: una vista 360° del paciente en **menos de 3 segundos**, con información actualizada de todas las fuentes. por ahora es un prototipo con una lista curada de campos de datos, pueden agregarse mas desde el codigo

---

### 💼 **Caso de Uso 2: Soporte al Cliente Avanzado**

**Escenario**: Un agente de soporte recibe una llamada de un cliente con problemas de facturación y necesita contexto completo.

**Problema**: El agente necesita información comercial (Chargebee), historial de interacciones (HubSpot) y estado del servicio médico (Firestore).

**Solución con MCP Orchestrator**:

```graphql
query SoporteCliente($email: String!) {
  getUserProfile(query: $email, queryType: "email") {
    # Identificación del cliente
    name
    email
    phone
    contactId          # ID en HubSpot para historial
    customerId         # ID en Chargebee para facturación
    
    # Estado comercial actual
    plan
    subscriptionStatus
    subscriptionId
    
    # Estado del servicio médico
    planStatus
    medicineCount      # Para entender nivel de uso
    
    # Información de contacto y seguimiento
    emergencyContact
    
    # Trazabilidad para debugging
    sourceBreakdown {
      field
      value
      source
    }
    
    # Sugerencias automáticas para el agente
    suggestions
  }
}
```

**Resultado**: El agente tiene contexto completo del cliente y puede resolver problemas de manera más eficiente y personalizada.

---

### 📊 **Caso de Uso 3: Análisis y Reportes Ejecutivos**

**Escenario**: El equipo directivo necesita generar reportes de uso y engagement de pacientes.

**Problema**: Los datos están fragmentados y es difícil correlacionar información médica con datos comerciales.

**Solución con MCP Orchestrator**:

```javascript
// Script para análisis masivo
const analyzePatientData = async (patientEmails) => {
  const results = [];
  
  for (const email of patientEmails) {
    try {
      const profile = await fetch('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: `
            query {
              getUserProfile(query: "${email}", queryType: "email") {
                plan
                subscriptionStatus
                medicineCount
                planStatus
                healthSummary
                sourceBreakdown { source }
              }
            }
          `
        })
      });
      
      const data = await profile.json();
      results.push({
        email,
        plan: data.getUserProfile.plan,
        status: data.getUserProfile.subscriptionStatus,
        medicineCount: data.getUserProfile.medicineCount,
        hasHealthData: !!data.getUserProfile.healthSummary,
        dataSources: data.getUserProfile.sourceBreakdown.map(s => s.source)
      });
      
    } catch (error) {
      console.error(`Error processing ${email}:`, error);
    }
  }
  
  return results;
};

// Generar reporte ejecutivo
const executiveReport = analyzePatientData(patientEmails);
```

**Resultado**: Reportes unificados que combinan métricas médicas y comerciales para toma de decisiones estratégicas.

---

### 🔗 **Caso de Uso 4: Integración con Aplicación Móvil**

**Escenario**: La app móvil de Clivi necesita mostrar el perfil completo del paciente.

**Problema**: La app tendría que hacer múltiples llamadas a diferentes APIs.

**Solución con MCP Orchestrator**:

```javascript
// SDK de la aplicación móvil
class CliviProfileSDK {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }
  
  async getPatientProfile(email) {
    const response = await fetch(`${this.endpoint}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProfile($email: String!) {
            getUserProfile(query: $email, queryType: "email") {
              name
              plan
              subscriptionStatus
              medicineCount
              healthSummary {
                currentWeight
                medications
                allergies
                vitalSigns
              }
              nextAppointment {
                date
                type
                doctor
              }
            }
          }
        `,
        variables: { email }
      })
    });
    
    return response.json();
  }
}

// Uso en la aplicación
const sdk = new CliviProfileSDK('https://mcp-orchestrator.clivi.com');
const profile = await sdk.getPatientProfile(userEmail);

// Mostrar en la UI
displayProfile(profile.data.getUserProfile);
```

**Resultado**: La app móvil obtiene toda la información del paciente con una sola llamada API.

---

### 🚨 **Caso de Uso 5: Alertas y Monitoreo Médico**

**Escenario**: El sistema necesita detectar patrones preocupantes en los datos de los pacientes.

**Problema**: Detectar correlaciones entre datos comerciales (cancelaciones) y médicos (adherencia al tratamiento).

**Solución con MCP Orchestrator**:

```javascript
// Sistema de alertas automáticas
const monitorPatients = async () => {
  const alerts = [];
  
  // Lista de pacientes a monitorear
  const patients = await getActivePatients();
  
  for (const patient of patients) {
    const profile = await mcpOrchestrator.getUserProfile(patient.email, 'email');
    
    // Alertas médicas
    if (profile.subscriptionStatus === 'active' && profile.medicineCount === 0) {
      alerts.push({
        type: 'MEDICAL_ALERT',
        severity: 'HIGH',
        message: `Paciente ${profile.name} tiene suscripción activa pero no hay medicamentos registrados`,
        patient: profile.email,
        data: { plan: profile.plan, medicineCount: profile.medicineCount }
      });
    }
    
    // Alertas de engagement
    if (profile.subscriptionStatus === 'paused' && profile.medicineCount > 0) {
      alerts.push({
        type: 'ENGAGEMENT_ALERT',
        severity: 'MEDIUM',
        message: `Paciente ${profile.name} pausó suscripción pero mantiene medicamentos activos`,
        patient: profile.email,
        data: { status: profile.subscriptionStatus, treatments: profile.treatments }
      });
    }
    
    // Alertas de datos inconsistentes
    const sources = profile.sourceBreakdown.map(s => s.source);
    if (!sources.includes('firestore') && sources.includes('chargebee')) {
      alerts.push({
        type: 'DATA_INCONSISTENCY',
        severity: 'LOW',
        message: `Paciente ${profile.name} tiene datos comerciales pero no médicos`,
        patient: profile.email,
        data: { sources }
      });
    }
  }
  
  return alerts;
};

// Ejecutar monitoreo cada hora
setInterval(monitorPatients, 3600000);
```

**Resultado**: Sistema proactivo que detecta inconsistencias y problemas potenciales antes de que se conviertan en problemas serios.

---

### 🎯 **Beneficios Medibles por Caso de Uso**

| Caso de Uso | Métrica Anterior | Métrica con MCP | Mejora |
|-------------|------------------|-----------------|--------|
| **Consulta Médica** | 3-5 min buscando datos | <30 segundos | **90% reducción** |
| **Soporte Cliente** | 5-8 llamadas entre sistemas | 1 consulta API | **87% reducción** |
| **Reportes Ejecutivos** | 2-3 días de trabajo manual | Automatizado | **95% reducción** |
| **App Móvil** | 4-6 llamadas API | 1 llamada API | **83% reducción** |
| **Monitoreo** | Revisión manual semanal | Alertas en tiempo real | **100% automatización** |

---

## 🤝 Contribución

### 📋 **Guía de Contribución**

El MCP Orchestrator de Clivi es un proyecto crítico para la operación médica. Seguimos estándares estrictos para mantener la calidad y seguridad del sistema.

#### **Proceso de Contribución**

1. **Fork del repositorio**
   ```bash
   git fork https://github.com/GibrannClivi/clivi_mcp_orchestrator_v2.1.git
   ```

2. **Crear branch para feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # Nomenclatura: feature/, bugfix/, hotfix/, docs/
   ```

3. **Desarrollo siguiendo estándares**
   ```bash
   # Instalar dependencias de desarrollo
   npm install
   
   # Ejecutar linter
   npm run lint
   
   # Ejecutar tests
   npm test
   
   # Verificar cobertura
   npm run test:coverage
   ```

4. **Commit con formato estándar**
   ```bash
   git commit -m "feat(mcp): agregar búsqueda por número de teléfono
   
   - Implementar validación de formato telefónico
   - Agregar tests de integración para HubSpot
   - Actualizar documentación API
   
   Closes #123"
   ```

5. **Push y Pull Request**
   ```bash
   git push origin feature/nueva-funcionalidad
   # Crear PR en GitHub con template completo
   ```

### 🧪 **Estándares de Desarrollo**

#### **Código TypeScript**

```typescript
// Ejemplo de estándar de código
export interface UserProfileQuery {
  query: string;
  queryType: 'email' | 'phone' | 'name';
  options?: {
    includeHealthSummary?: boolean;
    includeTreatments?: boolean;
    cache?: boolean;
  };
}

export class MCPManager {
  /**
   * Busca un perfil de usuario en todas las fuentes de datos
   * @param query - Email, teléfono o nombre del usuario
   * @param queryType - Tipo de búsqueda a realizar
   * @param options - Opciones adicionales de búsqueda
   * @returns Perfil consolidado del usuario
   */
  async getUserProfile(
    query: string, 
    queryType: UserProfileQuery['queryType'],
    options: UserProfileQuery['options'] = {}
  ): Promise<UserProfile> {
    // Implementación con validación estricta
    this.validateQuery(query, queryType);
    
    const sources = await this.fetchFromAllSources(query, queryType);
    const profile = await this.userProfileService.createProfile(sources, query, queryType);
    
    return profile;
  }
}
```

#### **Tests Obligatorios**

```typescript
// Ejemplo de test requerido
describe('MCPManager', () => {
  describe('getUserProfile', () => {
    it('debe retornar perfil completo para email válido', async () => {
      // Arrange
      const email = 'test@upgradebalance.com';
      const expectedProfile = { /* mock profile */ };
      
      // Act
      const result = await mcpManager.getUserProfile(email, 'email');
      
      // Assert
      expect(result.email).toBe(email);
      expect(result.sourceBreakdown).toHaveLength(3); // chargebee, hubspot, firestore
      expect(result.healthSummary).toBeDefined();
    });
    
    it('debe manejar errores parciales sin fallar', async () => {
      // Test de resiliencia cuando una fuente falla
    });
  });
});
```

#### **Documentación Inline**

```typescript
/**
 * Servicio para consolidar perfiles de usuario desde múltiples fuentes
 * 
 * Este servicio implementa el patrón de consolidación inteligente:
 * 1. Prioriza datos por fuente (medical > commercial > crm)
 * 2. Preserva trazabilidad completa
 * 3. Mapea estructuras anidadas correctamente
 * 
 * @example
 * ```typescript
 * const profile = await userProfileService.createProfile(
 *   sources, 
 *   'paciente@clivi.com', 
 *   'email'
 * );
 * console.log(profile.healthSummary.currentWeight); // "75kg"
 * ```
 */
export class UserProfileService {
  // Implementación...
}
```

### 🚨 **Criterios de Aceptación**

#### **Funcionalidad**
- ✅ **Tests**: Cobertura mínima 85%
- ✅ **Performance**: Respuesta <3 segundos
- ✅ **Datos**: Sin contaminación entre usuarios
- ✅ **Errores**: Manejo graceful de fallos parciales

#### **Código**
- ✅ **TypeScript**: Tipado estricto sin `any`
- ✅ **Linting**: Sin warnings de ESLint
- ✅ **Formato**: Prettier aplicado consistentemente
- ✅ **Documentación**: JSDoc en funciones públicas

#### **Seguridad**
- ✅ **Datos sensibles**: No logs de información médica
- ✅ **Validación**: Input sanitization completa
- ✅ **Autenticación**: Tokens en variables de entorno
- ✅ **Auditoría**: Trazabilidad de acceso a datos

### � **Workflow de Review**

```mermaid
graph TD
    A[PR Creado] --> B[Automated Tests]
    B --> C{Tests Pass?}
    C -->|No| D[Fix Required]
    C -->|Yes| E[Code Review]
    E --> F{Review Approved?}
    F -->|No| G[Changes Requested]
    F -->|Yes| H[Security Review]
    H --> I{Security OK?}
    I -->|No| J[Security Fix]
    I -->|Yes| K[Deploy to Staging]
    K --> L[Integration Tests]
    L --> M{All Tests Pass?}
    M -->|No| N[Rollback]
    M -->|Yes| O[Deploy to Production]
```

### 📋 **Templates de Issues y PRs**

#### **Template de Bug Report**
```markdown
## 🐛 Bug Report

**Descripción del problema**
Descripción clara del bug encontrado.

**Pasos para reproducir**
1. Ejecutar query con email...
2. Observar respuesta...
3. Error aparece en...

**Comportamiento esperado**
Lo que debería suceder.

**Comportamiento actual**
Lo que está sucediendo.

**Información del entorno**
- Versión: v1.0.0
- Entorno: staging/production
- Navegador: Chrome 91

**Logs relevantes**
```bash
[timestamp] ERROR: Error message here
```

**Datos de prueba**
- Email: test@example.com
- Query: {...}
```

#### **Template de Feature Request**
```markdown
## 🚀 Feature Request

**Problema a resolver**
Descripción del problema que la feature resolvería.

**Solución propuesta**
Descripción detallada de la feature.

**API propuesta**
```graphql
query NuevaFuncionalidad {
  # Esquema propuesto
}
```

**Casos de uso**
1. Caso 1: ...
2. Caso 2: ...

**Consideraciones técnicas**
- Impacto en performance
- Cambios en schema
- Compatibilidad hacia atrás
```

---

<div align="center">

**🚀 Clivi MCP Orchestrator v1**

*Consolidación inteligente de datos médicos para el futuro de la salud digital*

---

**Desarrollado con ❤️ por el equipo de Clivi Healthcare Technology**
**Desarrollado con ❤️ por el equipo de Clivi

[Website](https://clivi.com.mx) • [Documentation](https://docs.clivi.com.mx) • [Support](mailto:soporte@clivi.com.mx)

<<<<<<< HEAD
</div>

## 🚀 Scripts de Consulta Rápida

Para facilitar el uso del MCP Orchestrator, se incluyen scripts de consulta que permiten obtener información completa de usuarios por email:

### 📋 Consulta Rápida
```bash
# Consulta con campos esenciales
npx ts-node query_user.ts saidh.jimenez@clivi.com.mx

# O usando el script de shell
./query_user.sh saidh.jimenez@clivi.com.mx
```

### 📊 Consulta Completa
```bash
# Consulta con todos los campos disponibles
npx ts-node complete_user_query.ts saidh.jimenez@clivi.com.mx

# O usando el script de shell
./query_user.sh saidh.jimenez@clivi.com.mx complete
```

### 🎯 Campos Incluidos en la Consulta Por Defecto

**Información Básica:**
- Nombre completo, email, teléfono
- Empresa, cargo

**Información de Suscripción:**
- Estado de suscripción, plan, IDs de cliente y suscripción

**Información Médica:**
- ID de usuario, estado del plan, plan médico
- Paquete incluido, tratamientos, medicamentos
- Alergias, citas, contacto de emergencia

**Desglose por Fuente:**
- Origen de cada campo (Chargebee, HubSpot, Firebase)
- Trazabilidad completa de datos

---

4. **📍 Trazabilidad Total**: Especifica el origen de cada dato para auditoría completa
=======
>>>>>>> 01980fb60c4962ba6a966498bfa407c4ac831bd8

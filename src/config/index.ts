/**
 * Configuration loader for MCP Orchestrator
 * Loads all settings from environment variables
 */
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

export interface Config {
  // Core application
  env: string;
  projectName: string;
  port: number;
  
  // Chargebee
  chargebee: {
    site: string;
    apiKey: string;
    enabled: boolean;
  };
  
  // HubSpot
  hubspot: {
    apiKey: string;
    portalId: string;
    clientSecret: string;
    enabled: boolean;
  };
  
  // Firebase
  firebase: {
    credentials: string;
    credentialsPath: string;
    projectId: string;
    enabled: boolean;
  };
  
  // Google Cloud
  googleCloud: {
    projectId: string;
    credentials: string;
    region: string;
  };
  
  // Vertex AI
  vertexAI: {
    projectId: string;
    location: string;
    modelName: string;
  };
  
  // Firestore
  firestore: {
    projectId: string;
    collection: string;
  };
  
  // API Configuration
  api: {
    corsAllowOrigins: string;
    graphqlIntrospection: boolean;
    graphqlPlayground: boolean;
  };
  
  // Cache & Logging
  cache: {
    ttlSeconds: number;
  };
  
  logging: {
    level: string;
  };
}

export const config: Config = {
  env: process.env.ENV || 'development',
  projectName: process.env.PROJECT_NAME || 'mcp-orchestrator-v1',
  port: parseInt(process.env.PORT || '4000', 10),
  
  chargebee: {
    site: process.env.CHARGEBEE_SITE || '',
    apiKey: process.env.CHARGEBEE_API_KEY || '',
    enabled: !!(process.env.CHARGEBEE_SITE && process.env.CHARGEBEE_API_KEY),
  },
  
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY || '',
    portalId: process.env.HUBSPOT_PORTAL_ID || '',
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
    enabled: !!(process.env.HUBSPOT_API_KEY && process.env.HUBSPOT_PORTAL_ID),
  },
  
  firebase: {
    credentials: process.env.FIREBASE_CREDENTIALS || '',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    projectId: process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '',
    enabled: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS && (process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT)),
  },
  
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || '',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    region: process.env.GOOGLE_CLOUD_RUN_REGION || 'us-central1',
  },
  
  vertexAI: {
    projectId: process.env.VERTEXAI_PROJECT_ID || '',
    location: process.env.VERTEXAI_LOCATION || 'us-central1',
    modelName: process.env.VERTEXAI_MODEL_NAME || 'gemma-3-9b-it-e4b',
  },
  
  firestore: {
    projectId: process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '',
    collection: process.env.FIRESTORE_COLLECTION || 'orchestrator_cache',
  },
  
  api: {
    corsAllowOrigins: process.env.CORS_ALLOW_ORIGINS || '*',
    graphqlIntrospection: process.env.GRAPHQL_INTROSPECTION === 'true',
    graphqlPlayground: process.env.GRAPHQL_PLAYGROUND === 'true',
  },
  
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'INFO',
  },
};

// Validation
export function validateConfig(): void {
  const requiredEnvVars = [
    'CHARGEBEE_SITE',
    'CHARGEBEE_API_KEY',
    'HUBSPOT_API_KEY',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_CLOUD_PROJECT',
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }
}

export default config;

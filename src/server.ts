/**
 * MCP Orchestrator GraphQL Server
 * Node.js/TypeScript implementation using official MCP servers
 */
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/types';
import { resolvers } from './graphql/resolvers';
import { config, validateConfig } from './config';

async function startServer(): Promise<void> {
  // Validate configuration
  validateConfig();

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Enable introspection and playground in development
    introspection: config.api.graphqlIntrospection,
    plugins: [
      // Custom plugin for logging
      {
        async requestDidStart() {
          return {
            async didResolveOperation(requestContext: any) {
              console.log('GraphQL Operation:', requestContext.request.operationName);
            },
            async didEncounterErrors(requestContext: any) {
              console.error('GraphQL Errors:', requestContext.errors);
            },
          };
        },
      },
    ],
  });

  // Start the server with custom context and middleware
  const { url } = await startStandaloneServer(server, {
    listen: { port: config.port },
    context: async ({ req }) => {
      // Add request context here if needed
      return {
        // You can add user authentication, request ID, etc.
      };
    },
  });

  console.log(`🚀 MCP Orchestrator ready at: ${url}`);
  console.log(`📊 GraphQL Playground: ${url}`);
  console.log(`🏥 Health Check: ${url.replace('/graphql', '/health')}`);
  console.log(`🔧 Environment: ${config.env}`);
  console.log(`📋 Project: ${config.projectName}`);
  
  // Log enabled services
  const enabledServices = [];
  if (config.chargebee.enabled) enabledServices.push('Chargebee');
  if (config.hubspot.enabled) enabledServices.push('HubSpot');
  if (config.firebase.enabled) enabledServices.push('Firebase');
  
  console.log(`🔌 Enabled MCP Services: ${enabledServices.join(', ')}`);
  
  if (enabledServices.length === 0) {
    console.warn('⚠️  Warning: No MCP services are enabled. Check your environment variables.');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP Orchestrator...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down MCP Orchestrator...');
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

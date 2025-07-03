/**
 * GraphQL Resolvers for MCP Orchestrator
 * Implements the main query resolvers for user profile operations
 */
import { userProfileService } from '../../services/userProfileService';

export const resolvers = {
  Query: {
    /**
     * Get user profile by query (email, phone, or name)
     * NO FALLBACKS - Only real data or error
     */
    async getUserProfile(_parent: unknown, { query }: { query: string }) {
      try {
        // Handle empty queries - NO FALLBACKS, return error
        if (!query || query.trim().length === 0) {
          throw new Error('Query parameter is required and cannot be empty');
        }

        // Get user profile - will throw error if no real data found
        return await userProfileService.getUserProfile(query);
      } catch (error) {
        console.error('GraphQL getUserProfile error:', error);
        
        // NO FALLBACKS - Always throw the error
        // This enforces: "sin errores ni fallbacks, ni datos inventados"
        throw new Error(error instanceof Error ? error.message : 'Failed to get user profile');
      }
    },

    /**
     * Health check endpoint
     */
    async health() {
      try {
        return await userProfileService.getHealth();
      } catch (error) {
        console.error('GraphQL health check error:', error);
        return 'Service unavailable';
      }
    },

    /**
     * Get MCP system information including health and available tools
     */
    async getMCPSystemInfo() {
      try {
        const { mcpManager } = await import('../../mcp/mcpManager');
        
        const [health, documentation] = await Promise.all([
          mcpManager.getHealthStatus(),
          mcpManager.documentAvailableTools()
        ]);

        return {
          health: JSON.stringify(health),
          documentation: JSON.stringify(documentation),
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('GraphQL getMCPSystemInfo error:', error);
        return {
          health: JSON.stringify({}),
          documentation: JSON.stringify({}),
          timestamp: new Date().toISOString()
        };
      }
    },
  },
};

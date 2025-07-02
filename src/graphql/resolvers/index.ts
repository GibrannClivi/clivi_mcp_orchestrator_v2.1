/**
 * GraphQL Resolvers for MCP Orchestrator
 * Implements the main query resolvers for user profile operations
 */
import { userProfileService } from '../../services/userProfileService';

export const resolvers = {
  Query: {
    /**
     * Get user profile by query (email, phone, or name)
     * Enhanced with better error handling and fallbacks
     */
    async getUserProfile(_parent: unknown, { query }: { query: string }) {
      try {
        // Handle empty or very short queries gracefully
        if (!query || query.trim().length === 0) {
          console.warn('Empty query received, returning fallback data');
          return await userProfileService.getFallbackProfile('');
        }

        return await userProfileService.getUserProfile(query);
      } catch (error) {
        console.error('GraphQL getUserProfile error:', error);
        
        // For validation errors, try to provide fallback data instead of throwing
        if (error instanceof Error && error.message.includes('Invalid')) {
          console.warn('Invalid query format, providing fallback data:', query);
          try {
            return await userProfileService.getFallbackProfile(query);
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }
        
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

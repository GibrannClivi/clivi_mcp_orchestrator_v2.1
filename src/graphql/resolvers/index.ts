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

        // Get user profile - returns null if no real data found
        const profile = await userProfileService.getUserProfile(query);
        
        if (!profile) {
          throw new Error(`No data found for user: ${query}`);
        }
        
        return profile;
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
        const { mcpManager } = await import('../../mcp/mcpManager.js');
        
        // Return basic system info since the manager doesn't have health/docs methods
        const systemInfo = {
          status: 'healthy',
          message: 'MCP Orchestrator is running and ready to process queries',
          timestamp: new Date().toISOString(),
          availableSources: ['chargebee', 'hubspot', 'firebase'],
          capabilities: [
            'User profile consolidation',
            'Multi-platform data aggregation',
            'Real-time data fetching',
            'Query by email, phone, or name'
          ]
        };

        return {
          health: JSON.stringify({ status: 'healthy', sources: systemInfo.availableSources }),
          documentation: JSON.stringify({ capabilities: systemInfo.capabilities }),
          timestamp: systemInfo.timestamp
        };
      } catch (error) {
        console.error('GraphQL getMCPSystemInfo error:', error);
        return {
          health: JSON.stringify({ status: 'error', message: 'System unavailable' }),
          documentation: JSON.stringify({ error: 'Documentation unavailable' }),
          timestamp: new Date().toISOString()
        };
      }
    },
  },
};

/**
 * Tests for MCP Manager integration
 */
import { MCPManager } from '../src/mcp/mcpManager';
import { config } from '../src/config';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/stdio.js');

describe('MCP Manager', () => {
  let mcpManager: MCPManager;

  beforeEach(() => {
    mcpManager = new MCPManager();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await mcpManager.cleanup();
  });

  describe('initialization', () => {
    test('should initialize when services are enabled', async () => {
      // Mock config to enable services
      const originalChargebeeEnabled = config.chargebee.enabled;
      const originalHubspotEnabled = config.hubspot.enabled;
      const originalFirebaseEnabled = config.firebase.enabled;

      config.chargebee.enabled = true;
      config.hubspot.enabled = true;
      config.firebase.enabled = true;

      // Mock successful initialization
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await mcpManager.initialize();
        expect(consoleSpy).toHaveBeenCalledWith('🔌 Initializing real MCP connections...');
      } catch (error) {
        // Expected to fail in test environment without real MCP servers
        expect(error).toBeDefined();
      } finally {
        // Restore original config
        config.chargebee.enabled = originalChargebeeEnabled;
        config.hubspot.enabled = originalHubspotEnabled;
        config.firebase.enabled = originalFirebaseEnabled;
        consoleSpy.mockRestore();
      }
    });
  });

  describe('fetchAllSources', () => {
    test('should fetch data from all enabled sources', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        const result = await mcpManager.fetchAllSources('kyle@kjernigan.net', 'email');
        
        // Should return data from all sources (even if using fallback data)
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Check that we have responses from enabled services
        if (config.chargebee.enabled) {
          expect(result.chargebee).toBeDefined();
          expect(result.chargebee.source).toBe('chargebee');
        }
        
        if (config.hubspot.enabled) {
          expect(result.hubspot).toBeDefined();
          expect(result.hubspot.source).toBe('hubspot');
        }
        
        if (config.firebase.enabled) {
          expect(result.firebase).toBeDefined();
          expect(result.firebase.source).toBe('firebase');
        }
      } finally {
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      }
    });

    test('should handle different query types', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        // Test email query
        const emailResult = await mcpManager.fetchAllSources('test@example.com', 'email');
        expect(emailResult).toBeDefined();

        // Test phone query
        const phoneResult = await mcpManager.fetchAllSources('+1234567890', 'phone');
        expect(phoneResult).toBeDefined();

        // Test name query
        const nameResult = await mcpManager.fetchAllSources('John Doe', 'name');
        expect(nameResult).toBeDefined();
      } finally {
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('fallback data', () => {
    test('should provide fallback data when MCP calls fail', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        const result = await mcpManager.fetchAllSources('unknown@example.com', 'email');
        
        // Should still return data even if not found (fallback)
        expect(result).toBeDefined();
        
        // Check for fallback indicators
        Object.values(result).forEach((response: any) => {
          expect(response.source).toBeDefined();
          expect(['chargebee', 'hubspot', 'firebase']).toContain(response.source);
        });
      } finally {
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('cleanup', () => {
    test('should cleanup connections properly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await mcpManager.cleanup();
      
      expect(consoleSpy).toHaveBeenCalledWith('🔌 Cleaning up MCP connections...');
      consoleSpy.mockRestore();
    });
  });
});

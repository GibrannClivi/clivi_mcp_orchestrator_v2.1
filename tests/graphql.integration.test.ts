/**
 * Integration tests for GraphQL resolvers
 */
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../src/graphql/types';
import { resolvers } from '../src/graphql/resolvers';

describe('GraphQL Integration', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  afterAll(async () => {
    await server?.stop();
  });

  describe('getUserProfile resolver', () => {
    test('should return user profile for email query', async () => {
      const query = `
        query {
          getUserProfile(query: "kyle@kjernigan.net") {
            name
            email
            subscriptionStatus
            planStatus
            sourceBreakdown {
              field
              source
            }
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe('single');
      if (result.body.kind === 'single') {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data).toBeDefined();
        expect(result.body.singleResult.data?.getUserProfile).toBeDefined();
        
        const userProfile = result.body.singleResult.data?.getUserProfile as any;
        expect(userProfile.sourceBreakdown).toBeDefined();
        expect(Array.isArray(userProfile.sourceBreakdown)).toBe(true);
      }
    });

    test('should handle phone query with no data found', async () => {
      const query = `
        query {
          getUserProfile(query: "+1-555-123-4567") {
            phone
            name
            sourceBreakdown {
              field
              source
            }
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe('single');
      if (result.body.kind === 'single') {
        // Should return error when no data is found (no fallbacks)
        expect(result.body.singleResult.errors).toBeDefined();
        expect(result.body.singleResult.errors?.[0]?.message).toContain('No data found for user');
      }
    });

    test('should handle name query with no data found', async () => {
      const query = `
        query {
          getUserProfile(query: "Jose Antonio Trejo Torres") {
            name
            medicine
            lastAppointment {
              date
              status
            }
            sourceBreakdown {
              field
              source
            }
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe('single');
      if (result.body.kind === 'single') {
        // Should return error when no data is found (no fallbacks)
        expect(result.body.singleResult.errors).toBeDefined();
        expect(result.body.singleResult.errors?.[0]?.message).toContain('No data found for user');
      }
    });

    test('should handle empty queries with proper error response', async () => {
      const query = `
        query {
          getUserProfile(query: "") {
            name
            subscriptionStatus
            planStatus
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe('single');
      if (result.body.kind === 'single') {
        // Should return error for empty query (no fallbacks)
        expect(result.body.singleResult.errors).toBeDefined();
        expect(result.body.singleResult.errors?.[0]?.message).toContain('Query parameter is required and cannot be empty');
      }
    });
  });

  describe('health resolver', () => {
    test('should return health status', async () => {
      const query = `
        query {
          health
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe('single');
      if (result.body.kind === 'single') {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.health).toBeDefined();
        expect(typeof result.body.singleResult.data?.health).toBe('string');
      }
    });
  });

  describe('schema validation', () => {
    test('should validate against required schema structure', async () => {
      const introspectionQuery = `
        query {
          __schema {
            queryType {
              fields {
                name
                type {
                  name
                }
              }
            }
          }
        }
      `;

      const result = await server.executeOperation({
        query: introspectionQuery,
      });

      expect(result.body.kind).toBe('single');
      if (result.body.kind === 'single') {
        expect(result.body.singleResult.errors).toBeUndefined();
        
        const schema = result.body.singleResult.data?.__schema as any;
        expect(schema).toBeDefined();
        
        const queryFields = schema.queryType.fields;
        const fieldNames = queryFields.map((field: any) => field.name);
        
        expect(fieldNames).toContain('getUserProfile');
        expect(fieldNames).toContain('health');
      }
    });
  });
});

/**
 * Simple test to verify the GraphQL endpoint is working
 */

const apiEndpoint = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';

const simpleQuery = `
  query {
    health
  }
`;

async function testGraphQLEndpoint() {
  try {
    console.log('🧪 Testing GraphQL endpoint...');
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: simpleQuery
      })
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    const result = await response.json() as any;
    console.log('Response body:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGraphQLEndpoint();

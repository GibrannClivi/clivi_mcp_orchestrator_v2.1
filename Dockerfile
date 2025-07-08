# Multi-stage build for optimal production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user  
USER nodejs

# Expose port (Cloud Run uses PORT env var, default to 4000)
EXPOSE 4000

# Health check usando GraphQL
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const data = JSON.stringify({query: '{health}'}); const req = http.request({hostname: 'localhost', port: process.env.PORT || 4000, path: '/graphql', method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': data.length}}, (res) => { let body = ''; res.on('data', (chunk) => body += chunk); res.on('end', () => { try { const result = JSON.parse(body); process.exit(result.data && result.data.health ? 0 : 1); } catch(e) { process.exit(1); } }); }); req.on('error', () => process.exit(1)); req.write(data); req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]

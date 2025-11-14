# Dockerfile for Auth Service
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/services/auth-service/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY apps/services/auth-service/src ./src
COPY apps/services/auth-service/.env.example ./env

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "src/server.js"]
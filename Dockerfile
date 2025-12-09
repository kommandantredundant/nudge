# Stage 1: Build the React application
FROM node:18.17.0-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy only necessary source files for build
COPY public/ ./public/
COPY src/ ./src/

# Build the React application
RUN npm run build

# Stage 2: Production image
FROM node:18.17.0-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production dependencies (using updated flag)
RUN npm ci --omit=dev && npm cache clean --force

# Copy the built React application from builder stage
COPY --from=builder /app/build ./build

# Copy the server.js file
COPY server.js .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create data directory for persistence with proper permissions
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data && chmod -R 755 /app/data

# Switch to non-root user
USER nodejs

# Expose port 8765 to match the Express server
EXPOSE 8765

# Set environment to production
ENV NODE_ENV=production

# Add healthcheck to monitor application status
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8765/api/contacts', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the Express server with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
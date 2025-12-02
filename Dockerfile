# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the built React application from builder stage
COPY --from=builder /app/build ./build

# Copy the server.js file
COPY server.js .

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose port 8765 to match the Express server
EXPOSE 8765

# Set environment to production
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"]
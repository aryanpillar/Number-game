# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --workspace=server

# Copy source code
COPY server ./server

# Build TypeScript
RUN npm run build --workspace=server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm install --workspace=server --omit=dev

# Copy built files from builder
COPY --from=builder /app/server/dist ./server/dist

# Create data directory for SQLite
RUN mkdir -p /app/server/data

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/dist/index.js"]

# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Set environment variables** (optional):
   ```bash
   export JWT_SECRET=your-secure-secret-key
   ```

2. **Build and start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Docker Commands

### Start services
```bash
docker-compose up
```

### Start services in detached mode
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild containers
```bash
docker-compose up --build
```

### Remove volumes (deletes database)
```bash
docker-compose down -v
```

## Architecture

### Server Container
- **Image**: Node.js 18 Alpine
- **Port**: 3001
- **Volume**: `server-data` mounted at `/app/server/data` for SQLite database persistence
- **Environment Variables**:
  - `PORT`: Server port (default: 3001)
  - `JWT_SECRET`: Secret key for JWT tokens
  - `DATABASE_PATH`: Path to SQLite database file
  - `NODE_ENV`: Environment mode (production)

### Client Container
- **Image**: Nginx Alpine
- **Port**: 80 (mapped to host port 3000)
- **Proxy Configuration**: 
  - `/api/*` → proxied to server:3001
  - `/ws` → WebSocket connection to server:3001

## Data Persistence

The SQLite database is stored in a Docker volume named `server-data`. This ensures data persists across container restarts. To completely reset the database:

```bash
docker-compose down -v
docker-compose up --build
```

## Production Deployment

For production deployment:

1. **Set a secure JWT secret**:
   ```bash
   export JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Update docker-compose.yml** with production settings if needed

3. **Deploy using Docker Compose** or your preferred orchestration tool

## Troubleshooting

### Port conflicts
If ports 3000 or 3001 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
services:
  server:
    ports:
      - "YOUR_PORT:3001"
  client:
    ports:
      - "YOUR_PORT:80"
```

### Database issues
If you encounter database errors, try removing the volume and rebuilding:

```bash
docker-compose down -v
docker-compose up --build
```

### Build failures
Ensure you're running the command from the project root directory where `docker-compose.yml` is located.

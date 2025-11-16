# Docker Deployment Verification Steps

Since Docker is not currently installed on this system, please follow these steps to verify the Docker deployment:

## Prerequisites
1. Install Docker Desktop for Windows from https://www.docker.com/products/docker-desktop/
2. Ensure Docker Desktop is running

## Build and Run with Docker Compose

```bash
# From the project root directory
docker-compose up --build
```

This will:
- Build the server image (Node.js backend)
- Build the client image (React frontend with nginx)
- Start both containers
- Create a persistent volume for the SQLite database

## Verify Deployment

### 1. Check Containers are Running
```bash
docker ps
```

You should see two containers:
- `calculation-tree-server` (port 3001)
- `calculation-tree-client` (port 3000)

### 2. Test the Application
- Open browser to http://localhost:3000
- Verify you can see the application interface
- Test unregistered user features (viewing trees)
- Test registration and login
- Test creating starting numbers
- Test adding operations

### 3. Verify Data Persistence

```bash
# Stop the containers
docker-compose down

# Start them again
docker-compose up

# Verify that:
# - User accounts still exist
# - Calculation trees are still present
# - You can log in with previously created accounts
```

### 4. Check Logs

```bash
# Server logs
docker logs calculation-tree-server

# Client logs
docker logs calculation-tree-client
```

### 5. Verify Network Communication

```bash
# Test API endpoint directly
curl http://localhost:3001/api/trees

# Should return JSON with trees array
```

## Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (this will delete the database)
docker-compose down -v
```

## Expected Results

✅ Both containers build successfully without errors
✅ Application is accessible at http://localhost:3000
✅ API endpoints respond correctly at http://localhost:3001/api/*
✅ WebSocket connections work for real-time updates
✅ Data persists across container restarts
✅ No errors in container logs during normal operation

## Configuration Files Verified

All Docker configuration files are properly set up:

1. **server/Dockerfile**: Multi-stage build with production dependencies
2. **client/Dockerfile**: Multi-stage build with nginx for serving static files
3. **docker-compose.yml**: Orchestrates both services with networking and volumes
4. **client/nginx.conf**: Proxies API and WebSocket requests to backend

The deployment is ready for Docker testing once Docker is installed.

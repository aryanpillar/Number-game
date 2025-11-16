# Calculation Tree Application

A social communication platform where users interact through mathematical operations.

## Project Structure

```
calculation-tree-app/
├── server/          # Node.js/Express backend
├── client/          # React frontend
├── docker-compose.yml
└── package.json     # Root package for monorepo
```

## Prerequisites

- Node.js 18+
- npm
- Docker and Docker Compose (for containerized deployment)

## Development Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
# Copy example files and update with your values
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Run development servers:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Docker Deployment

Build and run with Docker Compose:

```bash
npm run docker:up
```

Stop containers:

```bash
npm run docker:down
```

## Building for Production

```bash
npm run build:server
npm run build:client
```

## Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## Architecture

- **Frontend**: React 18 with TypeScript, Vite
- **Backend**: Node.js with Express, TypeScript
- **Database**: SQLite
- **Authentication**: JWT with bcrypt
- **Real-time**: WebSocket

## License

MIT

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeDatabase } from './database/connection';
import authRoutes from './routes/authRoutes';
import treeRoutes from './routes/treeRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { websocketService } from './services/websocketService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Initialize WebSocket server
    websocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

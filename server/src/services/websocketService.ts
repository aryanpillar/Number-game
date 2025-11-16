import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WebSocketMessage {
  type: 'subscribe' | 'tree_created' | 'operation_added';
  data?: any;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket client connected');
      this.clients.add(ws);

      // Handle incoming messages
      ws.on('message', (message: string) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
          this.handleMessage(ws, parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('WebSocket server initialized');
  }

  /**
   * Handle incoming messages from clients
   */
  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (message.type === 'subscribe') {
      // Client is subscribing to updates
      // Already added to clients set on connection
      ws.send(JSON.stringify({ type: 'subscribed', message: 'Successfully subscribed to updates' }));
    }
  }

  /**
   * Broadcast tree_created event to all connected clients
   */
  broadcastTreeCreated(tree: any): void {
    this.broadcast({
      type: 'tree_created',
      data: tree
    });
  }

  /**
   * Broadcast operation_added event to all connected clients
   */
  broadcastOperationAdded(treeId: number, node: any): void {
    this.broadcast({
      type: 'operation_added',
      data: { treeId, node }
    });
  }

  /**
   * Broadcast a message to all connected clients
   */
  private broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

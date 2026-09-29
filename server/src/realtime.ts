import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';

interface RealtimeEvent {
  type: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
}

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function setupRealtimeServer(server: http.Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    // Send welcome / connection confirmation
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'NammaRescue Realtime Link Active',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Ignore invalid ping format
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('WebSocket client error:', err);
      clients.delete(ws);
    });
  });

  console.log('⚡ NammaRescue Realtime WebSocket Server running on /ws');
  return wss;
}

export function broadcastEvent(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload: any): void {
  const event: RealtimeEvent = {
    type: `${table.toUpperCase()}_${action}`,
    table,
    action,
    payload,
    timestamp: new Date().toISOString()
  };

  const message = JSON.stringify(event);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('Error sending realtime event to client:', err);
      }
    }
  }
}

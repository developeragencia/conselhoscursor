import { WebSocketServer } from 'ws';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { verify } from 'jsonwebtoken';
import { config } from 'dotenv';

// Carrega configurações de ambiente
config({ path: '.env.production' });

interface WebSocketMessage {
  type: string;
  token?: string;
  consultationId?: string;
  content?: string;
}

interface SecureWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
  consultationId?: string;
}

// Configurações SSL
const httpsServer = createServer({
  cert: readFileSync(process.env.SSL_CERT_PATH || ''),
  key: readFileSync(process.env.SSL_KEY_PATH || '')
});

// Inicializa WebSocket Server
const wss = new WebSocketServer({ server: httpsServer });

// Mapas para gerenciar conexões
const activeConnections = new Map<string, SecureWebSocket>();
const consultationRooms = new Map<string, {
  userWs?: SecureWebSocket;
  consultantWs?: SecureWebSocket;
}>();

// Configuração de Ping/Pong para manter conexões ativas
const PING_INTERVAL = 30000;
const PING_TIMEOUT = 5000;

wss.on('connection', (ws: SecureWebSocket) => {
  console.log('🔌 Nova conexão WebSocket estabelecida');
  let pingTimeout: NodeJS.Timeout;

  const heartbeat = () => {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => {
      ws.terminate();
    }, PING_TIMEOUT);
  };

  ws.on('message', async (data: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'auth':
          if (!message.token) return;
          try {
            const decoded = verify(message.token, process.env.JWT_SECRET || '') as { userId: string; role: string };
            ws.userId = decoded.userId;
            ws.userRole = decoded.role;
            activeConnections.set(decoded.userId, ws);
            ws.send(JSON.stringify({ type: 'auth_success', userId: decoded.userId }));
            heartbeat();
          } catch (error) {
            ws.send(JSON.stringify({ type: 'auth_error', message: 'Token inválido' }));
          }
          break;

        case 'join_consultation':
          if (!ws.userId || !message.consultationId) return;
          ws.consultationId = message.consultationId;
          
          if (!consultationRooms.has(message.consultationId)) {
            consultationRooms.set(message.consultationId, {});
          }
          
          const room = consultationRooms.get(message.consultationId);
          if (room) {
            if (ws.userRole === 'cliente') {
              room.userWs = ws;
            } else if (ws.userRole === 'consultor') {
              room.consultantWs = ws;
            }
          }
          
          ws.send(JSON.stringify({ 
            type: 'joined_consultation', 
            consultationId: message.consultationId 
          }));
          break;

        case 'message':
          if (!ws.consultationId || !message.content) return;
          const room = consultationRooms.get(ws.consultationId);
          if (room) {
            const broadcastMessage = {
              type: 'message',
              consultationId: ws.consultationId,
              senderType: ws.userRole === 'cliente' ? 'user' : 'consultant',
              content: message.content,
              timestamp: new Date().toISOString()
            };

            if (room.userWs?.readyState === 1) {
              room.userWs.send(JSON.stringify(broadcastMessage));
            }
            if (room.consultantWs?.readyState === 1) {
              room.consultantWs.send(JSON.stringify(broadcastMessage));
            }
          }
          break;
      }
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Erro no processamento da mensagem' 
      }));
    }
  });

  ws.on('close', () => {
    clearTimeout(pingTimeout);
    if (ws.userId) {
      activeConnections.delete(ws.userId);
    }
    if (ws.consultationId) {
      const room = consultationRooms.get(ws.consultationId);
      if (room) {
        if (room.userWs === ws) room.userWs = undefined;
        if (room.consultantWs === ws) room.consultantWs = undefined;
      }
    }
  });

  ws.on('pong', heartbeat);
});

// Inicia ping em todas as conexões
setInterval(() => {
  wss.clients.forEach((ws: SecureWebSocket) => {
    if (ws.readyState === 1) {
      ws.ping();
    }
  });
}, PING_INTERVAL);

// Inicia servidor
const PORT = process.env.WS_PORT || 5001;
httpsServer.listen(PORT, () => {
  console.log(`🔒 Servidor WebSocket seguro rodando na porta ${PORT}`);
});
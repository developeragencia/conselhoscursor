import { WebSocketServer, WebSocket as WSWebSocket } from 'ws';
import { createServer } from 'https';
import { readFileSync, existsSync } from 'fs';
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

interface SecureWebSocket extends WSWebSocket {
  userId?: string;
  userRole?: string;
  consultationId?: string;
}

// Only create HTTPS server if SSL certificates exist
let httpsServer: any;
if (process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH && 
    existsSync(process.env.SSL_CERT_PATH) && existsSync(process.env.SSL_KEY_PATH)) {
  httpsServer = createServer({
    cert: readFileSync(process.env.SSL_CERT_PATH),
    key: readFileSync(process.env.SSL_KEY_PATH)
  });
} else {
  // For Render and other cloud platforms, use HTTP
  const { createServer: createHTTPServer } = await import('http');
  httpsServer = createHTTPServer();
}

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

wss.on('connection', (ws: WSWebSocket) => {
  const secureWs = ws as SecureWebSocket;
  console.log('🔌 Nova conexão WebSocket estabelecida');
  let pingTimeout: NodeJS.Timeout;

  const heartbeat = () => {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => {
      secureWs.terminate();
    }, PING_TIMEOUT);
  };

  secureWs.on('message', async (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'auth':
          if (!message.token) return;
          try {
            const decoded = verify(message.token, process.env.JWT_SECRET || '') as { userId: string; role: string };
            secureWs.userId = decoded.userId;
            secureWs.userRole = decoded.role;
            activeConnections.set(decoded.userId, secureWs);
            secureWs.send(JSON.stringify({ type: 'auth_success', userId: decoded.userId }));
            heartbeat();
          } catch (error) {
            secureWs.send(JSON.stringify({ type: 'auth_error', message: 'Token inválido' }));
          }
          break;

        case 'join_consultation':
          if (!secureWs.userId || !message.consultationId) return;
          secureWs.consultationId = message.consultationId;
          
          if (!consultationRooms.has(message.consultationId)) {
            consultationRooms.set(message.consultationId, {});
          }
          
          const consultRoom = consultationRooms.get(message.consultationId);
          if (consultRoom) {
            if (secureWs.userRole === 'cliente') {
              consultRoom.userWs = secureWs;
            } else if (secureWs.userRole === 'consultor') {
              consultRoom.consultantWs = secureWs;
            }
          }
          
          secureWs.send(JSON.stringify({ 
            type: 'joined_consultation', 
            consultationId: message.consultationId 
          }));
          break;

        case 'message':
          if (!secureWs.consultationId || !message.content) return;
          const messageRoom = consultationRooms.get(secureWs.consultationId);
          if (messageRoom) {
            const broadcastMessage = {
              type: 'message',
              consultationId: secureWs.consultationId,
              senderType: secureWs.userRole === 'cliente' ? 'user' : 'consultant',
              content: message.content,
              timestamp: new Date().toISOString()
            };

            if (messageRoom.userWs?.readyState === 1) {
              messageRoom.userWs.send(JSON.stringify(broadcastMessage));
            }
            if (messageRoom.consultantWs?.readyState === 1) {
              messageRoom.consultantWs.send(JSON.stringify(broadcastMessage));
            }
          }
          break;
      }
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error);
      secureWs.send(JSON.stringify({ 
        type: 'error', 
        message: 'Erro no processamento da mensagem' 
      }));
    }
  });

  secureWs.on('close', () => {
    clearTimeout(pingTimeout);
    if (secureWs.userId) {
      activeConnections.delete(secureWs.userId);
    }
    if (secureWs.consultationId) {
      const closeRoom = consultationRooms.get(secureWs.consultationId);
      if (closeRoom) {
        if (closeRoom.userWs === secureWs) closeRoom.userWs = undefined;
        if (closeRoom.consultantWs === secureWs) closeRoom.consultantWs = undefined;
      }
    }
  });

  secureWs.on('pong', heartbeat);
});

// Inicia ping em todas as conexões
setInterval(() => {
  wss.clients.forEach((ws: WSWebSocket) => {
    if (ws.readyState === 1) {
      ws.ping();
    }
  });
}, PING_INTERVAL);

// Inicia servidor
const PORT = parseInt(process.env.WS_PORT || '5001', 10);
httpsServer.listen(PORT, () => {
  console.log(`🔒 Servidor WebSocket seguro rodando na porta ${PORT}`);
});

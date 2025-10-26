import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { Pool } from '@neondatabase/serverless';

const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  role?: string;
  consultationId?: string;
  isAlive?: boolean;
}

interface ConsultationRoom {
  consultationId: string;
  userWs?: AuthenticatedWebSocket;
  consultantWs?: AuthenticatedWebSocket;
  lastActivity: Date;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private db: Pool | null;
  private consultationRooms: Map<string, ConsultationRoom> = new Map();
  private userConnections: Map<string, AuthenticatedWebSocket> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: Server, db: Pool | null) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.db = db;
    this.initialize();
  }

  private initialize() {
    console.log('🔌 WebSocket Server initialized on /ws');

    this.wss.on('connection', this.handleConnection.bind(this));

    // Heartbeat para detectar conexões mortas
    this.startHeartbeat();
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const socket = ws as AuthenticatedWebSocket;
        
        if (socket.isAlive === false) {
          console.log('💀 Conexão morta detectada, terminando...');
          this.handleDisconnect(socket);
          return socket.terminate();
        }

        socket.isAlive = false;
        socket.ping();
      });
    }, 30000); // 30 segundos
  }

  private handleConnection(ws: AuthenticatedWebSocket, request: any) {
    console.log('🔗 Nova conexão WebSocket');

    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        this.sendError(ws, 'Erro ao processar mensagem');
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('Erro WebSocket:', error);
      this.handleDisconnect(ws);
    });

    // Solicitar autenticação
    this.send(ws, {
      type: 'auth_required',
      message: 'Por favor, autentique-se enviando token JWT'
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: any) {
    const { type, ...data } = message;

    switch (type) {
      case 'auth':
        await this.handleAuth(ws, data);
        break;

      case 'join_consultation':
        await this.handleJoinConsultation(ws, data);
        break;

      case 'leave_consultation':
        await this.handleLeaveConsultation(ws, data);
        break;

      case 'chat_message':
        await this.handleChatMessage(ws, data);
        break;

      case 'typing':
        await this.handleTyping(ws, data);
        break;

      case 'ping':
        this.send(ws, { type: 'pong', timestamp: Date.now() });
        break;

      default:
        this.sendError(ws, 'Tipo de mensagem desconhecido');
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, data: any) {
    try {
      const { token } = data;

      if (!token) {
        this.sendError(ws, 'Token não fornecido');
        return ws.close();
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      ws.userId = decoded.userId;
      ws.role = decoded.role;

      // Armazenar conexão do usuário
      this.userConnections.set(ws.userId, ws);

      this.send(ws, {
        type: 'auth_success',
        userId: ws.userId,
        role: ws.role
      });

      console.log(`✅ Usuário autenticado: ${ws.userId} (${ws.role})`);

      // Verificar se há consulta ativa
      if (this.db) {
        const result = await this.db.query(
          'SELECT id FROM consultations WHERE (user_id = $1 OR consultant_id = $1) AND status = \'active\'',
          [ws.userId]
        );

        if (result.rows.length > 0) {
          const consultationId = result.rows[0].id;
          this.send(ws, {
            type: 'active_consultation',
            consultationId
          });
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      this.sendError(ws, 'Token inválido');
      ws.close();
    }
  }

  private async handleJoinConsultation(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) {
      return this.sendError(ws, 'Não autenticado');
    }

    const { consultationId } = data;

    if (!consultationId) {
      return this.sendError(ws, 'ID da consulta não fornecido');
    }

    try {
      // Verificar se a consulta existe e o usuário tem permissão
      if (this.db) {
        const result = await this.db.query(
          'SELECT * FROM consultations WHERE id = $1 AND (user_id = $2 OR consultant_id = $2)',
          [consultationId, ws.userId]
        );

        if (result.rows.length === 0) {
          return this.sendError(ws, 'Consulta não encontrada ou sem permissão');
        }

        const consultation = result.rows[0];

        // Criar ou obter sala
        let room = this.consultationRooms.get(consultationId);
        if (!room) {
          room = {
            consultationId,
            lastActivity: new Date()
          };
          this.consultationRooms.set(consultationId, room);
        }

        // Adicionar à sala
        ws.consultationId = consultationId;
        
        if (ws.userId === consultation.user_id) {
          room.userWs = ws;
        } else {
          room.consultantWs = ws;
        }

        room.lastActivity = new Date();

        this.send(ws, {
          type: 'joined_consultation',
          consultationId,
          consultation
        });

        // Notificar o outro participante
        const otherWs = ws.userId === consultation.user_id ? room.consultantWs : room.userWs;
        if (otherWs && otherWs.readyState === WebSocket.OPEN) {
          this.send(otherWs, {
            type: 'participant_joined',
            consultationId
          });
        }

        console.log(`👥 Usuário ${ws.userId} entrou na consulta ${consultationId}`);
      }
    } catch (error) {
      console.error('Erro ao entrar na consulta:', error);
      this.sendError(ws, 'Erro ao entrar na consulta');
    }
  }

  private async handleLeaveConsultation(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.consultationId) {
      return;
    }

    const room = this.consultationRooms.get(ws.consultationId);
    if (room) {
      const otherWs = room.userWs === ws ? room.consultantWs : room.userWs;
      
      if (otherWs && otherWs.readyState === WebSocket.OPEN) {
        this.send(otherWs, {
          type: 'participant_left',
          consultationId: ws.consultationId
        });
      }

      // Remover da sala
      if (room.userWs === ws) {
        room.userWs = undefined;
      } else {
        room.consultantWs = undefined;
      }

      // Se sala vazia, remover
      if (!room.userWs && !room.consultantWs) {
        this.consultationRooms.delete(ws.consultationId);
      }
    }

    ws.consultationId = undefined;
    console.log(`👋 Usuário ${ws.userId} saiu da consulta`);
  }

  private async handleChatMessage(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId || !ws.consultationId) {
      return this.sendError(ws, 'Não está em uma consulta');
    }

    const { content } = data;

    if (!content || content.trim() === '') {
      return this.sendError(ws, 'Mensagem vazia');
    }

    try {
      // Salvar no banco
      if (this.db) {
        const consultation = await this.db.query(
          'SELECT * FROM consultations WHERE id = $1',
          [ws.consultationId]
        );

        if (consultation.rows.length === 0) {
          return this.sendError(ws, 'Consulta não encontrada');
        }

        const cons = consultation.rows[0];
        const sender_type = ws.userId === cons.user_id ? 'user' : 'consultant';

        const message_id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await this.db.query(`
          INSERT INTO messages (
            id, consultation_id, sender_type, content, created_at
          ) VALUES ($1, $2, $3, $4, NOW())
          RETURNING *
        `, [message_id, ws.consultationId, sender_type, content]);

        const savedMessage = result.rows[0];

        // Enviar para ambos os participantes
        const room = this.consultationRooms.get(ws.consultationId);
        if (room) {
          const messageData = {
            type: 'chat_message',
            message: savedMessage,
            sender: {
              id: ws.userId,
              role: ws.role
            }
          };

          // Enviar para remetente (confirmação)
          this.send(ws, {
            ...messageData,
            type: 'message_sent'
          });

          // Enviar para destinatário
          const otherWs = room.userWs === ws ? room.consultantWs : room.userWs;
          if (otherWs && otherWs.readyState === WebSocket.OPEN) {
            this.send(otherWs, messageData);
          }

          room.lastActivity = new Date();
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      this.sendError(ws, 'Erro ao enviar mensagem');
    }
  }

  private async handleTyping(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId || !ws.consultationId) {
      return;
    }

    const { isTyping } = data;

    const room = this.consultationRooms.get(ws.consultationId);
    if (room) {
      const otherWs = room.userWs === ws ? room.consultantWs : room.userWs;
      
      if (otherWs && otherWs.readyState === WebSocket.OPEN) {
        this.send(otherWs, {
          type: 'typing',
          isTyping,
          userId: ws.userId
        });
      }
    }
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    console.log(`🔌 Conexão fechada: ${ws.userId || 'não autenticado'}`);

    // Remover da consulta
    if (ws.consultationId) {
      this.handleLeaveConsultation(ws, {});
    }

    // Remover do mapa de conexões
    if (ws.userId) {
      this.userConnections.delete(ws.userId);
    }
  }

  private send(ws: AuthenticatedWebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private sendError(ws: AuthenticatedWebSocket, error: string) {
    this.send(ws, {
      type: 'error',
      error
    });
  }

  // Método público para enviar notificação a um usuário
  public sendNotificationToUser(userId: string, notification: any) {
    const ws = this.userConnections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.send(ws, {
        type: 'notification',
        ...notification
      });
    }
  }

  // Método público para broadcast
  public broadcast(data: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Limpar ao desligar
  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}


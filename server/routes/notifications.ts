import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';

// Middleware de autenticação
const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Interface para notificações
interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'consultation' | 'credit' | 'testimonial';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: Date;
}

export const createNotificationsRouter = (db: Pool | null, wsHandler?: any) => {
  const router = Router();

  // Aplicar autenticação em todas as rotas
  router.use(authenticate);

  // Criar tabela de notificações se não existir
  const initNotificationsTable = async () => {
    if (db) {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            data JSONB,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `);

        await db.query(`
          CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        `);

        await db.query(`
          CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
        `);

        console.log('✅ Tabela de notificações inicializada');
      } catch (error) {
        console.error('Erro ao criar tabela de notificações:', error);
      }
    }
  };

  initNotificationsTable();

  // GET /api/notifications - Listar notificações do usuário
  router.get('/', async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { unread_only = 'false', limit = '50', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let query = 'SELECT * FROM notifications WHERE user_id = $1';
      const params: any[] = [user_id];

      if (unread_only === 'true') {
        query += ' AND read = false';
      }

      query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await db.query(query, params);

      // Contar não lidas
      const unreadCount = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
        [user_id]
      );

      res.json({
        notifications: result.rows,
        total: result.rowCount,
        unread_count: parseInt(unreadCount.rows[0].count)
      });
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      res.status(500).json({ error: 'Erro ao listar notificações' });
    }
  });

  // PUT /api/notifications/:id/read - Marcar como lida
  router.put('/:id/read', async (req: any, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
      res.status(500).json({ error: 'Erro ao marcar notificação' });
    }
  });

  // PUT /api/notifications/read-all - Marcar todas como lidas
  router.put('/read-all', async (req: any, res) => {
    try {
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      await db.query(
        'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
        [user_id]
      );

      res.json({ message: 'Todas as notificações marcadas como lidas' });
    } catch (error) {
      console.error('Erro ao marcar notificações:', error);
      res.status(500).json({ error: 'Erro ao marcar notificações' });
    }
  });

  // DELETE /api/notifications/:id - Deletar notificação
  router.delete('/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      res.json({ message: 'Notificação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro ao deletar notificação' });
    }
  });

  // DELETE /api/notifications/clear-all - Limpar todas as notificações lidas
  router.delete('/clear-all', async (req: any, res) => {
    try {
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      await db.query(
        'DELETE FROM notifications WHERE user_id = $1 AND read = true',
        [user_id]
      );

      res.json({ message: 'Notificações lidas removidas' });
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      res.status(500).json({ error: 'Erro ao limpar notificações' });
    }
  });

  // Função auxiliar para criar notificação
  const createNotification = async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    if (!db) return null;

    try {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await db.query(`
        INSERT INTO notifications (
          id, user_id, type, title, message, data, read, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
        RETURNING *
      `, [id, notification.user_id, notification.type, notification.title, notification.message, JSON.stringify(notification.data || {})]);

      const savedNotification = result.rows[0];

      // Enviar via WebSocket se disponível
      if (wsHandler) {
        wsHandler.sendNotificationToUser(notification.user_id, {
          notification: savedNotification
        });
      }

      return savedNotification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  };

  // Exportar função de criação
  (router as any).createNotification = createNotification;

  return router;
};

// Funções utilitárias para criar notificações
export const NotificationHelpers = {
  consultantOnline: (user_id: string, consultant_name: string) => ({
    user_id,
    type: 'info' as const,
    title: 'Consultor Online',
    message: `${consultant_name} está online e disponível para consulta!`,
    data: { consultant_name }
  }),

  lowCredits: (user_id: string, balance: number) => ({
    user_id,
    type: 'warning' as const,
    title: 'Créditos Baixos',
    message: `Seu saldo está baixo (R$ ${balance.toFixed(2)}). Recarregue para continuar usando o serviço.`,
    data: { balance }
  }),

  consultationStarted: (user_id: string, consultant_name: string, consultation_id: string) => ({
    user_id,
    type: 'success' as const,
    title: 'Consulta Iniciada',
    message: `Sua consulta com ${consultant_name} foi iniciada!`,
    data: { consultant_name, consultation_id }
  }),

  consultationEnded: (user_id: string, duration: number, total: number) => ({
    user_id,
    type: 'info' as const,
    title: 'Consulta Finalizada',
    message: `Consulta finalizada. Duração: ${duration} minutos. Total: R$ ${total.toFixed(2)}`,
    data: { duration, total }
  }),

  creditsAdded: (user_id: string, amount: number, new_balance: number) => ({
    user_id,
    type: 'success' as const,
    title: 'Créditos Adicionados',
    message: `R$ ${amount.toFixed(2)} adicionados. Novo saldo: R$ ${new_balance.toFixed(2)}`,
    data: { amount, new_balance }
  }),

  testimonialApproved: (user_id: string, consultant_name: string) => ({
    user_id,
    type: 'success' as const,
    title: 'Avaliação Aprovada',
    message: `Sua avaliação sobre ${consultant_name} foi aprovada e publicada!`,
    data: { consultant_name }
  }),

  newMessage: (user_id: string, sender_name: string, consultation_id: string) => ({
    user_id,
    type: 'info' as const,
    title: 'Nova Mensagem',
    message: `${sender_name} enviou uma mensagem`,
    data: { sender_name, consultation_id }
  })
};


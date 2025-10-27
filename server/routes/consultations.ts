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

export const createConsultationsRouter = (db: Pool | null) => {
  const router = Router();

  // GET /api/consultations/stats - Estatísticas do consultor
  router.get('/stats', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Buscar estatísticas do consultor
      const statsResult = await db.query(`
        SELECT 
          COUNT(*) as total_consultations,
          COALESCE(SUM(total_charged), 0) as total_earnings,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_consultations,
          COALESCE(SUM(total_charged) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as monthly_earnings
        FROM consultations
        WHERE consultant_id IN (
          SELECT id FROM consultants WHERE id = $1
        )
        AND status = 'ended'
      `, [user_id]);

      const stats = statsResult.rows[0] || {};

      // Buscar avaliação média (pode ser implementado depois)
      const rating = 4.8; // Mock por enquanto
      const reviews = 0;

      res.json({
        earnings: parseFloat(stats.monthly_earnings) || 0,
        consultations: parseInt(stats.monthly_consultations) || 0,
        rating: rating,
        reviews: reviews
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  // POST /api/consultations/start - Iniciar consulta
  router.post('/start', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { consultant_id } = req.body;

      if (!consultant_id) {
        return res.status(400).json({ error: 'ID do consultor é obrigatório' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // Verificar se o consultor existe e está disponível
        const consultantResult = await db.query(
          'SELECT * FROM consultants WHERE id = $1',
          [consultant_id]
        );

        if (consultantResult.rows.length === 0) {
          await db.query('ROLLBACK');
          return res.status(404).json({ error: 'Consultor não encontrado' });
        }

        const consultant = consultantResult.rows[0];

        if (consultant.status !== 'online') {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: 'Consultor não está disponível' });
        }

        // Verificar se o usuário tem créditos suficientes (mínimo 5 créditos)
        const userResult = await db.query(
          'SELECT credits FROM users WHERE id = $1',
          [user_id]
        );

        const userCredits = parseFloat(userResult.rows[0].credits);
        if (userCredits < 5) {
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'Créditos insuficientes. Mínimo de R$ 5,00 necessário',
            current_credits: userCredits
          });
        }

        // Verificar se já existe consulta ativa
        const activeConsultation = await db.query(
          'SELECT id FROM consultations WHERE user_id = $1 AND status = \'active\'',
          [user_id]
        );

        if (activeConsultation.rows.length > 0) {
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'Você já possui uma consulta ativa',
            consultation_id: activeConsultation.rows[0].id
          });
        }

        // Criar consulta
        const consultation_id = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await db.query(`
          INSERT INTO consultations (
            id, user_id, consultant_id, started_at, status, 
            price_per_minute_snapshot, total_charged, created_at
          ) VALUES ($1, $2, $3, NOW(), 'active', $4, 0.00, NOW())
          RETURNING *
        `, [consultation_id, user_id, consultant_id, consultant.price_per_minute]);

        // Atualizar status do consultor para ocupado
        await db.query(
          'UPDATE consultants SET status = \'busy\' WHERE id = $1',
          [consultant_id]
        );

        await db.query('COMMIT');

        res.status(201).json({
          message: 'Consulta iniciada com sucesso',
          consultation: result.rows[0],
          consultant: {
            name: consultant.name,
            title: consultant.title,
            image_url: consultant.image_url
          }
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      res.status(500).json({ error: 'Erro ao iniciar consulta' });
    }
  });

  // POST /api/consultations/:id/end - Finalizar consulta
  router.post('/:id/end', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // Buscar consulta
        const consultationResult = await db.query(
          'SELECT * FROM consultations WHERE id = $1',
          [id]
        );

        if (consultationResult.rows.length === 0) {
          await db.query('ROLLBACK');
          return res.status(404).json({ error: 'Consulta não encontrada' });
        }

        const consultation = consultationResult.rows[0];

        // Verificar se o usuário tem permissão
        if (consultation.user_id !== user_id && req.user.role !== 'consultor') {
          await db.query('ROLLBACK');
          return res.status(403).json({ error: 'Acesso negado' });
        }

        if (consultation.status !== 'active') {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: 'Consulta já foi finalizada' });
        }

        // Calcular duração e valor
        const startedAt = new Date(consultation.started_at);
        const endedAt = new Date();
        const durationMinutes = Math.ceil((endedAt.getTime() - startedAt.getTime()) / 60000);
        const pricePerMinute = parseFloat(consultation.price_per_minute_snapshot);
        const totalCharged = durationMinutes * pricePerMinute;

        // Verificar se usuário tem créditos suficientes
        const userResult = await db.query(
          'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
          [consultation.user_id]
        );

        const userCredits = parseFloat(userResult.rows[0].credits);

        if (userCredits < totalCharged) {
          // Cobrar apenas o que tem disponível
          const actualCharged = Math.min(userCredits, totalCharged);
          
          await db.query(`
            UPDATE consultations 
            SET status = 'ended', ended_at = NOW(), total_charged = $1 
            WHERE id = $2
          `, [actualCharged, id]);

          // Debitar créditos do usuário
          await db.query(
            'UPDATE users SET credits = 0 WHERE id = $1',
            [consultation.user_id]
          );

          // Registrar transação
          const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.query(`
            INSERT INTO credits_transactions (
              id, user_id, type, amount, balance_after, reference_id, created_at
            ) VALUES ($1, $2, 'debit', $3, 0, $4, NOW())
          `, [transaction_id, consultation.user_id, actualCharged, `consultation_${id}`]);

        } else {
          // Cobrar valor total
          await db.query(`
            UPDATE consultations 
            SET status = 'ended', ended_at = NOW(), total_charged = $1 
            WHERE id = $2
          `, [totalCharged, id]);

          // Debitar créditos do usuário
          const newBalance = userCredits - totalCharged;
          await db.query(
            'UPDATE users SET credits = $1 WHERE id = $2',
            [newBalance, consultation.user_id]
          );

          // Registrar transação
          const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.query(`
            INSERT INTO credits_transactions (
              id, user_id, type, amount, balance_after, reference_id, created_at
            ) VALUES ($1, $2, 'debit', $3, $4, $5, NOW())
          `, [transaction_id, consultation.user_id, totalCharged, newBalance, `consultation_${id}`]);
        }

        // Liberar consultor
        await db.query(
          'UPDATE consultants SET status = \'online\' WHERE id = $1',
          [consultation.consultant_id]
        );

        await db.query('COMMIT');

        res.json({
          message: 'Consulta finalizada com sucesso',
          duration_minutes: durationMinutes,
          total_charged: totalCharged,
          consultation_id: id
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      res.status(500).json({ error: 'Erro ao finalizar consulta' });
    }
  });

  // GET /api/consultations/active - Buscar consulta ativa do usuário
  router.get('/active', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT c.*, 
               cons.name as consultant_name,
               cons.title as consultant_title,
               cons.image_url as consultant_image
        FROM consultations c
        JOIN consultants cons ON c.consultant_id = cons.id
        WHERE c.user_id = $1 AND c.status = 'active'
      `, [user_id]);

      if (result.rows.length === 0) {
        return res.json({ active: false });
      }

      const consultation = result.rows[0];
      const startedAt = new Date(consultation.started_at);
      const now = new Date();
      const elapsedMinutes = Math.ceil((now.getTime() - startedAt.getTime()) / 60000);
      const pricePerMinute = parseFloat(consultation.price_per_minute_snapshot);
      const currentCost = elapsedMinutes * pricePerMinute;

      res.json({
        active: true,
        consultation: {
          ...consultation,
          elapsed_minutes: elapsedMinutes,
          current_cost: currentCost
        }
      });
    } catch (error) {
      console.error('Erro ao buscar consulta ativa:', error);
      res.status(500).json({ error: 'Erro ao buscar consulta ativa' });
    }
  });

  // GET /api/consultations/history - Histórico de consultas
  router.get('/history', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { limit = '20', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT c.*, 
               cons.name as consultant_name,
               cons.title as consultant_title,
               cons.image_url as consultant_image
        FROM consultations c
        JOIN consultants cons ON c.consultant_id = cons.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `, [user_id, parseInt(limit as string), parseInt(offset as string)]);

      res.json({
        consultations: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  });

  // GET /api/consultations/:id - Buscar consulta específica
  router.get('/:id', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT c.*, 
               cons.name as consultant_name,
               cons.title as consultant_title,
               cons.image_url as consultant_image,
               u.first_name as user_first_name,
               u.last_name as user_last_name
        FROM consultations c
        JOIN consultants cons ON c.consultant_id = cons.id
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      const consultation = result.rows[0];

      // Verificar permissão
      if (consultation.user_id !== user_id && req.user.role !== 'consultor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json(consultation);
    } catch (error) {
      console.error('Erro ao buscar consulta:', error);
      res.status(500).json({ error: 'Erro ao buscar consulta' });
    }
  });

  // POST /api/consultations/:id/messages - Enviar mensagem
  router.post('/:id/messages', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const user_id = req.user.userId;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Mensagem não pode estar vazia' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Verificar se a consulta existe e está ativa
      const consultationResult = await db.query(
        'SELECT * FROM consultations WHERE id = $1',
        [id]
      );

      if (consultationResult.rows.length === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      const consultation = consultationResult.rows[0];

      // Determinar tipo do remetente
      let sender_type: 'user' | 'consultant';
      if (consultation.user_id === user_id) {
        sender_type = 'user';
      } else if (req.user.role === 'consultor') {
        sender_type = 'consultant';
      } else {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Salvar mensagem
      const message_id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result = await db.query(`
        INSERT INTO messages (
          id, consultation_id, sender_type, content, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [message_id, id, sender_type, content]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
  });

  // GET /api/consultations/:id/messages - Listar mensagens
  router.get('/:id/messages', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Verificar permissão
      const consultationResult = await db.query(
        'SELECT * FROM consultations WHERE id = $1',
        [id]
      );

      if (consultationResult.rows.length === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      const consultation = consultationResult.rows[0];

      if (consultation.user_id !== user_id && req.user.role !== 'consultor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Buscar mensagens
      const result = await db.query(`
        SELECT * FROM messages 
        WHERE consultation_id = $1 
        ORDER BY created_at ASC
      `, [id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
  });

  return router;
};


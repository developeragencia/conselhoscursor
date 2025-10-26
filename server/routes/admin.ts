import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';

// Middleware de autenticação admin
const authenticateAdmin = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const createAdminRouter = (db: Pool | null) => {
  const router = Router();

  // Aplicar middleware de autenticação em todas as rotas
  router.use(authenticateAdmin);

  // ===== DASHBOARD =====

  // GET /api/admin/dashboard - Estatísticas gerais
  router.get('/dashboard', async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Buscar estatísticas
      const [
        usersCount,
        consultantsCount,
        consultationsCount,
        activeConsultations,
        totalRevenue,
        pendingTestimonials
      ] = await Promise.all([
        db.query('SELECT COUNT(*) as count FROM users WHERE role = \'cliente\''),
        db.query('SELECT COUNT(*) as count FROM consultants'),
        db.query('SELECT COUNT(*) as count FROM consultations'),
        db.query('SELECT COUNT(*) as count FROM consultations WHERE status = \'active\''),
        db.query('SELECT COALESCE(SUM(total_charged), 0) as total FROM consultations WHERE status = \'ended\''),
        db.query('SELECT COUNT(*) as count FROM testimonials WHERE approved = false')
      ]);

      // Últimas consultas
      const recentConsultations = await db.query(`
        SELECT c.*, 
               u.first_name || ' ' || u.last_name as user_name,
               cons.name as consultant_name
        FROM consultations c
        JOIN users u ON c.user_id = u.id
        JOIN consultants cons ON c.consultant_id = cons.id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);

      // Consultores mais ativos
      const topConsultants = await db.query(`
        SELECT cons.*, 
               COUNT(c.id) as consultation_count,
               COALESCE(SUM(c.total_charged), 0) as total_earned
        FROM consultants cons
        LEFT JOIN consultations c ON cons.id = c.consultant_id AND c.status = 'ended'
        GROUP BY cons.id
        ORDER BY consultation_count DESC
        LIMIT 5
      `);

      res.json({
        stats: {
          users: parseInt(usersCount.rows[0].count),
          consultants: parseInt(consultantsCount.rows[0].count),
          totalConsultations: parseInt(consultationsCount.rows[0].count),
          activeConsultations: parseInt(activeConsultations.rows[0].count),
          totalRevenue: parseFloat(totalRevenue.rows[0].total),
          pendingTestimonials: parseInt(pendingTestimonials.rows[0].count)
        },
        recentConsultations: recentConsultations.rows,
        topConsultants: topConsultants.rows
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  // ===== GERENCIAR USUÁRIOS =====

  // GET /api/admin/users - Listar usuários
  router.get('/users', async (req, res) => {
    try {
      const { role, search, limit = '50', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let query = 'SELECT id, email, first_name, last_name, role, phone, cpf, credits, is_active, created_at FROM users WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (role) {
        query += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      if (search) {
        query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await db.query(query, params);

      res.json({
        users: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  });

  // PUT /api/admin/users/:id/toggle-status - Ativar/desativar usuário
  router.put('/users/:id/toggle-status', async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        message: result.rows[0].is_active ? 'Usuário ativado' : 'Usuário desativado',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  });

  // POST /api/admin/users/:id/add-credits - Adicionar créditos manualmente
  router.post('/users/:id/add-credits', async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      await db.query('BEGIN');

      try {
        const userResult = await db.query(
          'SELECT credits FROM users WHERE id = $1',
          [id]
        );

        if (userResult.rows.length === 0) {
          await db.query('ROLLBACK');
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const currentBalance = parseFloat(userResult.rows[0].credits);
        const newBalance = currentBalance + parseFloat(amount);

        await db.query(
          'UPDATE users SET credits = $1 WHERE id = $2',
          [newBalance, id]
        );

        const transaction_id = `txn_admin_${Date.now()}`;
        await db.query(`
          INSERT INTO credits_transactions (
            id, user_id, type, amount, balance_after, reference_id, created_at
          ) VALUES ($1, $2, 'add', $3, $4, $5, NOW())
        `, [transaction_id, id, amount, newBalance, `admin_${reason || 'manual'}`]);

        await db.query('COMMIT');

        res.json({
          message: 'Créditos adicionados com sucesso',
          amount: parseFloat(amount),
          new_balance: newBalance
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
      res.status(500).json({ error: 'Erro ao adicionar créditos' });
    }
  });

  // ===== GERENCIAR CONSULTORES =====

  // PUT /api/admin/consultants/:id/approve - Aprovar consultor
  router.put('/consultants/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'UPDATE consultants SET status = \'online\' WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consultor não encontrado' });
      }

      res.json({
        message: 'Consultor aprovado e ativado',
        consultant: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao aprovar consultor:', error);
      res.status(500).json({ error: 'Erro ao aprovar consultor' });
    }
  });

  // ===== RELATÓRIOS =====

  // GET /api/admin/reports/revenue - Relatório de receita
  router.get('/reports/revenue', async (req, res) => {
    try {
      const { start_date, end_date, period = 'daily' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let dateFormat = 'YYYY-MM-DD';
      if (period === 'monthly') dateFormat = 'YYYY-MM';
      if (period === 'yearly') dateFormat = 'YYYY';

      let query = `
        SELECT 
          TO_CHAR(created_at, '${dateFormat}') as period,
          COUNT(*) as consultation_count,
          SUM(total_charged) as revenue
        FROM consultations
        WHERE status = 'ended'
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (start_date) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      query += ' GROUP BY period ORDER BY period DESC';

      const result = await db.query(query, params);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  });

  // GET /api/admin/reports/consultants - Relatório de consultores
  router.get('/reports/consultants', async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT 
          cons.*,
          COUNT(DISTINCT c.id) as total_consultations,
          COUNT(DISTINCT CASE WHEN c.status = 'ended' THEN c.id END) as completed_consultations,
          COALESCE(SUM(CASE WHEN c.status = 'ended' THEN c.total_charged ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN c.status = 'ended' THEN c.total_charged ELSE NULL END), 0) as avg_consultation_value
        FROM consultants cons
        LEFT JOIN consultations c ON cons.id = c.consultant_id
        GROUP BY cons.id
        ORDER BY total_revenue DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao gerar relatório de consultores:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  });

  // ===== LOGS E AUDITORIA =====

  // GET /api/admin/logs/transactions - Log de transações
  router.get('/logs/transactions', async (req, res) => {
    try {
      const { user_id, type, limit = '100', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let query = `
        SELECT t.*, u.email, u.first_name || ' ' || u.last_name as user_name
        FROM credits_transactions t
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (user_id) {
        query += ` AND t.user_id = $${paramIndex}`;
        params.push(user_id);
        paramIndex++;
      }

      if (type) {
        query += ` AND t.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await db.query(query, params);

      res.json({
        transactions: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      res.status(500).json({ error: 'Erro ao buscar logs' });
    }
  });

  // ===== CONFIGURAÇÕES =====

  // PUT /api/admin/settings - Atualizar configurações do sistema
  router.put('/settings', async (req, res) => {
    try {
      const settings = req.body;
      
      // TODO: Implementar armazenamento de configurações no banco
      // Por enquanto, retornar sucesso
      
      res.json({
        message: 'Configurações atualizadas com sucesso',
        settings
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  });

  return router;
};


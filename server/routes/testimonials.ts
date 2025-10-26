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

export const createTestimonialsRouter = (db: Pool | null) => {
  const router = Router();

  // GET /api/testimonials - Listar depoimentos aprovados
  router.get('/', async (req, res) => {
    try {
      const { consultant_id, limit = '20', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let query = `
        SELECT t.*, 
               u.first_name, 
               u.last_name,
               c.name as consultant_name
        FROM testimonials t
        JOIN users u ON t.user_id = u.id
        JOIN consultants c ON t.consultant_id = c.id
        WHERE t.approved = true
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (consultant_id) {
        query += ` AND t.consultant_id = $${paramIndex}`;
        params.push(consultant_id);
        paramIndex++;
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await db.query(query, params);

      // Formatar resposta
      const testimonials = result.rows.map(row => ({
        id: row.id,
        userName: `${row.first_name} ${row.last_name.charAt(0)}.`,
        rating: row.rating,
        comment: row.comment,
        consultantName: row.consultant_name,
        date: row.created_at,
        verified: true
      }));

      res.json(testimonials);
    } catch (error) {
      console.error('Erro ao listar depoimentos:', error);
      res.status(500).json({ error: 'Erro ao listar depoimentos' });
    }
  });

  // POST /api/testimonials - Criar novo depoimento (requer autenticação)
  router.post('/', authenticate, async (req: any, res) => {
    try {
      const { consultant_id, rating, comment } = req.body;
      const user_id = req.user.userId;

      if (!consultant_id || !rating || !comment) {
        return res.status(400).json({ 
          error: 'Consultor, avaliação e comentário são obrigatórios' 
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Verificar se o consultor existe
      const consultantCheck = await db.query(
        'SELECT id FROM consultants WHERE id = $1',
        [consultant_id]
      );

      if (consultantCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Consultor não encontrado' });
      }

      // Verificar se o usuário já avaliou este consultor
      const existingReview = await db.query(
        'SELECT id FROM testimonials WHERE user_id = $1 AND consultant_id = $2',
        [user_id, consultant_id]
      );

      if (existingReview.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Você já avaliou este consultor' 
        });
      }

      const id = `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await db.query(`
        INSERT INTO testimonials (
          id, user_id, consultant_id, rating, comment, approved, created_at
        ) VALUES ($1, $2, $3, $4, $5, false, NOW())
        RETURNING *
      `, [id, user_id, consultant_id, rating, comment]);

      res.status(201).json({
        message: 'Depoimento enviado para aprovação',
        testimonial: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar depoimento:', error);
      res.status(500).json({ error: 'Erro ao criar depoimento' });
    }
  });

  // PUT /api/testimonials/:id/approve - Aprovar depoimento (apenas admin)
  router.put('/:id/approve', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Verificar se é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        UPDATE testimonials 
        SET approved = true 
        WHERE id = $1 
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Depoimento não encontrado' });
      }

      // Atualizar rating e review_count do consultor
      await db.query(`
        UPDATE consultants
        SET 
          review_count = review_count + 1,
          rating = (
            SELECT AVG(rating)::numeric(3,2)
            FROM testimonials
            WHERE consultant_id = $1 AND approved = true
          )
        WHERE id = $1
      `, [result.rows[0].consultant_id]);

      res.json({
        message: 'Depoimento aprovado com sucesso',
        testimonial: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao aprovar depoimento:', error);
      res.status(500).json({ error: 'Erro ao aprovar depoimento' });
    }
  });

  // GET /api/testimonials/pending - Listar depoimentos pendentes (apenas admin)
  router.get('/pending', authenticate, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT t.*, 
               u.first_name, 
               u.last_name,
               u.email,
               c.name as consultant_name
        FROM testimonials t
        JOIN users u ON t.user_id = u.id
        JOIN consultants c ON t.consultant_id = c.id
        WHERE t.approved = false
        ORDER BY t.created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar depoimentos pendentes:', error);
      res.status(500).json({ error: 'Erro ao listar depoimentos pendentes' });
    }
  });

  // DELETE /api/testimonials/:id - Deletar depoimento
  router.delete('/:id', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Verificar se o depoimento pertence ao usuário ou se é admin
      const testimonial = await db.query(
        'SELECT * FROM testimonials WHERE id = $1',
        [id]
      );

      if (testimonial.rows.length === 0) {
        return res.status(404).json({ error: 'Depoimento não encontrado' });
      }

      if (testimonial.rows[0].user_id !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await db.query('DELETE FROM testimonials WHERE id = $1', [id]);

      // Recalcular rating do consultor se o depoimento estava aprovado
      if (testimonial.rows[0].approved) {
        await db.query(`
          UPDATE consultants
          SET 
            review_count = review_count - 1,
            rating = COALESCE((
              SELECT AVG(rating)::numeric(3,2)
              FROM testimonials
              WHERE consultant_id = $1 AND approved = true
            ), 5.00)
          WHERE id = $1
        `, [testimonial.rows[0].consultant_id]);
      }

      res.json({ message: 'Depoimento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar depoimento:', error);
      res.status(500).json({ error: 'Erro ao deletar depoimento' });
    }
  });

  return router;
};


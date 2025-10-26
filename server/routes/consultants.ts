import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';

export const createConsultantsRouter = (db: Pool | null) => {
  const router = Router();

  // GET /api/consultants - Listar todos consultores (com filtros)
  router.get('/', async (req, res) => {
    try {
      const { specialty, status, limit = '20', offset = '0' } = req.query;
      
      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let query = 'SELECT * FROM consultants WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (specialty) {
        query += ` AND specialty ILIKE $${paramIndex}`;
        params.push(`%${specialty}%`);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY rating DESC, review_count DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await db.query(query, params);
      
      res.json({
        consultants: result.rows,
        total: result.rowCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error) {
      console.error('Erro ao listar consultores:', error);
      res.status(500).json({ error: 'Erro ao listar consultores' });
    }
  });

  // GET /api/consultants/featured - Consultores em destaque (top rated)
  router.get('/featured', async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Primeiro tenta buscar consultores online
      let result = await db.query(`
        SELECT 
          id,
          name,
          slug,
          title,
          specialty,
          description,
          price_per_minute as "pricePerMinute",
          rating,
          review_count as "reviewCount",
          image_url as "imageUrl",
          whatsapp,
          status,
          is_active as "isActive",
          created_at as "createdAt"
        FROM consultants 
        WHERE status = 'online'
        ORDER BY rating DESC, review_count DESC 
        LIMIT 6
      `);

      // Se não houver consultores online, busca todos os ativos
      if (result.rows.length === 0) {
        result = await db.query(`
          SELECT 
            id,
            name,
            slug,
            title,
            specialty,
            description,
            price_per_minute as "pricePerMinute",
            rating,
            review_count as "reviewCount",
            image_url as "imageUrl",
            whatsapp,
            status,
            is_active as "isActive",
            created_at as "createdAt"
          FROM consultants 
          WHERE is_active = true
          ORDER BY rating DESC, review_count DESC 
          LIMIT 6
        `);
      }

      // Se ainda não houver, busca todos
      if (result.rows.length === 0) {
        result = await db.query(`
          SELECT 
            id,
            name,
            slug,
            title,
            specialty,
            description,
            price_per_minute as "pricePerMinute",
            rating,
            review_count as "reviewCount",
            image_url as "imageUrl",
            whatsapp,
            status,
            is_active as "isActive",
            created_at as "createdAt"
          FROM consultants 
          ORDER BY rating DESC, review_count DESC 
          LIMIT 6
        `);
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar consultores em destaque:', error);
      res.status(500).json({ error: 'Erro ao buscar consultores' });
    }
  });

  // GET /api/consultants/:id - Buscar consultor por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'SELECT * FROM consultants WHERE id = $1 OR slug = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consultor não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar consultor:', error);
      res.status(500).json({ error: 'Erro ao buscar consultor' });
    }
  });

  // POST /api/consultants - Criar novo consultor (apenas admin)
  router.post('/', async (req, res) => {
    try {
      const { name, slug, title, specialty, description, price_per_minute, image_url } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const id = `consultant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await db.query(`
        INSERT INTO consultants (
          id, slug, name, title, specialty, description, 
          price_per_minute, image_url, status, rating, review_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'offline', 5.00, 0)
        RETURNING *
      `, [id, slug, name, title, specialty, description, price_per_minute || 3.50, image_url]);

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Erro ao criar consultor:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Slug já está em uso' });
      }
      res.status(500).json({ error: 'Erro ao criar consultor' });
    }
  });

  // PUT /api/consultants/:id - Atualizar consultor
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, title, specialty, description, price_per_minute, status, image_url } = req.body;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (name) {
        updates.push(`name = $${paramIndex}`);
        params.push(name);
        paramIndex++;
      }
      if (title) {
        updates.push(`title = $${paramIndex}`);
        params.push(title);
        paramIndex++;
      }
      if (specialty) {
        updates.push(`specialty = $${paramIndex}`);
        params.push(specialty);
        paramIndex++;
      }
      if (description) {
        updates.push(`description = $${paramIndex}`);
        params.push(description);
        paramIndex++;
      }
      if (price_per_minute) {
        updates.push(`price_per_minute = $${paramIndex}`);
        params.push(price_per_minute);
        paramIndex++;
      }
      if (status) {
        updates.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }
      if (image_url !== undefined) {
        updates.push(`image_url = $${paramIndex}`);
        params.push(image_url);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      params.push(id);
      const result = await db.query(`
        UPDATE consultants 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consultor não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar consultor:', error);
      res.status(500).json({ error: 'Erro ao atualizar consultor' });
    }
  });

  // DELETE /api/consultants/:id - Deletar consultor (apenas admin)
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'DELETE FROM consultants WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consultor não encontrado' });
      }

      res.json({ message: 'Consultor deletado com sucesso', consultant: result.rows[0] });
    } catch (error) {
      console.error('Erro ao deletar consultor:', error);
      res.status(500).json({ error: 'Erro ao deletar consultor' });
    }
  });

  // GET /api/consultants/:id/testimonials - Listar depoimentos do consultor
  router.get('/:id/testimonials', async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = '10' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT t.*, u.first_name, u.last_name 
        FROM testimonials t
        JOIN users u ON t.user_id = u.id
        WHERE t.consultant_id = $1 AND t.approved = true
        ORDER BY t.created_at DESC
        LIMIT $2
      `, [id, parseInt(limit as string)]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error);
      res.status(500).json({ error: 'Erro ao buscar depoimentos' });
    }
  });

  return router;
};


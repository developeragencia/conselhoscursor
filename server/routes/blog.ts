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

// Middleware de autenticação admin
const authenticateAdmin = (req: any, res: any, next: any) => {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'consultor') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  });
};

export const createBlogRouter = (db: Pool | null) => {
  const router = Router();

  // Criar tabelas se não existirem
  const initBlogTables = async () => {
    if (!db) return;

    try {
      // Tabela de posts
      await db.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          author_id TEXT NOT NULL,
          category TEXT,
          tags TEXT[],
          image_url TEXT,
          published BOOLEAN DEFAULT false,
          views INTEGER DEFAULT 0,
          read_time INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          published_at TIMESTAMP
        )
      `);

      // Tabela de categorias
      await db.query(`
        CREATE TABLE IF NOT EXISTS blog_categories (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          post_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Tabela de comentários
      await db.query(`
        CREATE TABLE IF NOT EXISTS blog_comments (
          id TEXT PRIMARY KEY,
          post_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Índices
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
      `);
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at);
      `);
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
      `);

      console.log('✅ Tabelas de blog inicializadas');
    } catch (error) {
      console.error('Erro ao criar tabelas de blog:', error);
    }
  };

  initBlogTables();

  // ===== POSTS =====

  // GET /api/blog/posts - Listar posts (públicos)
  router.get('/posts', async (req, res) => {
    try {
      const { category, tag, search, limit = '20', offset = '0', published_only = 'true' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      let query = `
        SELECT p.*, u.first_name || ' ' || u.last_name as author_name
        FROM blog_posts p
        JOIN users u ON p.author_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (published_only === 'true') {
        query += ' AND p.published = true';
      }

      if (category) {
        query += ` AND p.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (tag) {
        query += ` AND $${paramIndex} = ANY(p.tags)`;
        params.push(tag);
        paramIndex++;
      }

      if (search) {
        query += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await db.query(query, params);

      res.json({
        posts: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao listar posts:', error);
      res.status(500).json({ error: 'Erro ao listar posts' });
    }
  });

  // GET /api/blog/posts/:slug - Buscar post por slug
  router.get('/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT p.*, u.first_name || ' ' || u.last_name as author_name, u.id as author_id
        FROM blog_posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.slug = $1
      `, [slug]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      const post = result.rows[0];

      // Incrementar visualizações
      await db.query(
        'UPDATE blog_posts SET views = views + 1 WHERE id = $1',
        [post.id]
      );
      post.views += 1;

      res.json(post);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      res.status(500).json({ error: 'Erro ao buscar post' });
    }
  });

  // POST /api/blog/posts - Criar post (admin/consultor)
  router.post('/posts', authenticateAdmin, async (req: any, res) => {
    try {
      const { title, slug, excerpt, content, category, tags, image_url, published } = req.body;
      const author_id = req.user.userId;

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Título, slug e conteúdo são obrigatórios' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calcular tempo de leitura (aproximado: 200 palavras por minuto)
      const wordCount = content.split(/\s+/).length;
      const read_time = Math.max(1, Math.ceil(wordCount / 200));

      const result = await db.query(`
        INSERT INTO blog_posts (
          id, title, slug, excerpt, content, author_id, category, tags,
          image_url, published, read_time, created_at, updated_at, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), ${published ? 'NOW()' : 'NULL'})
        RETURNING *
      `, [id, title, slug, excerpt || '', content, author_id, category || '', tags || [], image_url || '', !!published, read_time]);

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Slug já está em uso' });
      }
      res.status(500).json({ error: 'Erro ao criar post' });
    }
  });

  // PUT /api/blog/posts/:id - Atualizar post
  router.put('/posts/:id', authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { title, excerpt, content, category, tags, image_url, published } = req.body;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Verificar se o post pertence ao autor (exceto admin)
      if (req.user.role !== 'admin') {
        const postCheck = await db.query(
          'SELECT author_id FROM blog_posts WHERE id = $1',
          [id]
        );

        if (postCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Post não encontrado' });
        }

        if (postCheck.rows[0].author_id !== req.user.userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (title) {
        updates.push(`title = $${paramIndex}`);
        params.push(title);
        paramIndex++;
      }
      if (excerpt !== undefined) {
        updates.push(`excerpt = $${paramIndex}`);
        params.push(excerpt);
        paramIndex++;
      }
      if (content) {
        updates.push(`content = $${paramIndex}`);
        params.push(content);
        paramIndex++;

        // Recalcular tempo de leitura
        const wordCount = content.split(/\s+/).length;
        const read_time = Math.max(1, Math.ceil(wordCount / 200));
        updates.push(`read_time = $${paramIndex}`);
        params.push(read_time);
        paramIndex++;
      }
      if (category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }
      if (tags !== undefined) {
        updates.push(`tags = $${paramIndex}`);
        params.push(tags);
        paramIndex++;
      }
      if (image_url !== undefined) {
        updates.push(`image_url = $${paramIndex}`);
        params.push(image_url);
        paramIndex++;
      }
      if (published !== undefined) {
        updates.push(`published = $${paramIndex}`);
        params.push(published);
        paramIndex++;

        // Se está publicando agora, definir published_at
        if (published) {
          updates.push(`published_at = NOW()`);
        }
      }

      updates.push('updated_at = NOW()');

      if (updates.length === 1) { // Apenas updated_at
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      params.push(id);
      const result = await db.query(`
        UPDATE blog_posts 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      res.status(500).json({ error: 'Erro ao atualizar post' });
    }
  });

  // DELETE /api/blog/posts/:id - Deletar post
  router.delete('/posts/:id', authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Verificar permissão
      if (req.user.role !== 'admin') {
        const postCheck = await db.query(
          'SELECT author_id FROM blog_posts WHERE id = $1',
          [id]
        );

        if (postCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Post não encontrado' });
        }

        if (postCheck.rows[0].author_id !== req.user.userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }

      // Deletar comentários do post
      await db.query('DELETE FROM blog_comments WHERE post_id = $1', [id]);

      // Deletar post
      const result = await db.query(
        'DELETE FROM blog_posts WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.json({ message: 'Post deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      res.status(500).json({ error: 'Erro ao deletar post' });
    }
  });

  // ===== CATEGORIAS =====

  // GET /api/blog/categories - Listar categorias
  router.get('/categories', async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query('SELECT * FROM blog_categories ORDER BY name');

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao listar categorias' });
    }
  });

  // POST /api/blog/categories - Criar categoria (admin)
  router.post('/categories', authenticateAdmin, async (req, res) => {
    try {
      const { name, slug, description } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await db.query(`
        INSERT INTO blog_categories (id, name, slug, description, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [id, name, slug, description || '']);

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Categoria já existe' });
      }
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  });

  // ===== COMENTÁRIOS =====

  // GET /api/blog/posts/:postId/comments - Listar comentários
  router.get('/posts/:postId/comments', async (req, res) => {
    try {
      const { postId } = req.params;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT c.*, u.first_name || ' ' || u.last_name as user_name
        FROM blog_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1 AND c.approved = true
        ORDER BY c.created_at DESC
      `, [postId]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      res.status(500).json({ error: 'Erro ao listar comentários' });
    }
  });

  // POST /api/blog/posts/:postId/comments - Criar comentário
  router.post('/posts/:postId/comments', authenticate, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const user_id = req.user.userId;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comentário não pode estar vazio' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const id = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await db.query(`
        INSERT INTO blog_comments (id, post_id, user_id, content, approved, created_at)
        VALUES ($1, $2, $3, $4, false, NOW())
        RETURNING *
      `, [id, postId, user_id, content]);

      res.status(201).json({
        message: 'Comentário enviado para aprovação',
        comment: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      res.status(500).json({ error: 'Erro ao criar comentário' });
    }
  });

  return router;
};


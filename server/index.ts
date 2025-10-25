import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

// Database
let db: Pool | null = null;

// Initialize database
const initDB = async () => {
  try {
    if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) {
      const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
      db = new Pool({ connectionString });
      
      // Create tables if they don't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          phone TEXT,
          cpf TEXT,
          credits DECIMAL(10,2) DEFAULT 10.00,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS credits_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('add','debit')),
          amount DECIMAL(10,2) NOT NULL,
          balance_after DECIMAL(10,2) NOT NULL,
          reference_id TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS consultations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          consultant_id TEXT NOT NULL,
          started_at TIMESTAMP DEFAULT NOW(),
          ended_at TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended','cancelled')),
          price_per_minute_snapshot DECIMAL(10,2) NOT NULL,
          total_charged DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          consultation_id TEXT NOT NULL,
          sender_type TEXT NOT NULL CHECK (sender_type IN ('user','consultant')),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          consultant_id TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS consultants (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          title TEXT,
          specialty TEXT,
          description TEXT,
          price_per_minute DECIMAL(10,2) NOT NULL DEFAULT 3.50,
          rating DECIMAL(3,2) DEFAULT 5.00,
          review_count INTEGER DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'online',
          image_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('✅ Database initialized successfully');
    } else {
      console.log('⚠️ No database connection string found, running in memory mode');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    db = null;
  }
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));

// === AUTH ENDPOINTS ===

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password, role, cpf, phone } = req.body;

    if (!email || !name || !password || !role || !cpf || !phone) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: email, password, name, role, cpf, phone' 
      });
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hash = await bcrypt.hash(password, 10);
    
    const user = {
      id,
      email: email.toLowerCase(),
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' ') || '',
      password_hash: hash,
      role,
      phone,
      cpf,
      credits: role === 'cliente' ? '10.00' : '0.00',
      is_active: true,
      created_at: new Date()
    };

    if (db) {
      try {
        await db.query(`
          INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [user.id, user.email, user.first_name, user.last_name, user.password_hash, 
            user.role, user.phone, user.cpf, user.credits, user.is_active, user.created_at]);
      } catch (e) {
        if (e.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
        throw e;
      }
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, firstName: user.first_name, role: user.role },
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registrado com sucesso!`
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }

    let user;
    if (db) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      user = result.rows[0];
    }

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    if (!(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        credits: user.credits
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Get user info
app.get('/api/auth/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let user;
    
    if (db) {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
      user = result.rows[0];
    }

    if (!user || !user.is_active) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      credits: user.credits
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// === CREDITS ENDPOINTS ===

app.get('/api/credits/balance', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (db) {
      const result = await db.query('SELECT credits FROM users WHERE id = $1', [decoded.userId]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
      return res.json({ credits: result.rows[0].credits });
    }
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// === CONSULTANTS ENDPOINTS ===

app.get('/api/consultants/featured', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Maria Silva",
      title: "Especialista em Tarot e Astrologia",
      specialty: "Tarot e Astrologia",
      experience: "10 anos",
      rating: "4.9",
      reviewCount: 1250,
      description: "Especialista em leitura de tarot com mais de 10 anos de experiência",
      pricePerMinute: "3.50",
      status: "online",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      nextAvailable: "Agora",
      specialties: ["Tarot", "Astrologia", "Amor"]
    },
    {
      id: 2,
      name: "João Santos",
      title: "Especialista em Numerologia",
      specialty: "Numerologia",
      experience: "8 anos",
      rating: "4.8",
      reviewCount: 980,
      description: "Numerólogo experiente com foco em autoconhecimento e desenvolvimento pessoal",
      pricePerMinute: "2.80",
      status: "busy",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Ana Costa",
      title: "Médium e Vidente",
      specialty: "Mediunidade",
      experience: "15 anos",
      rating: "4.95",
      reviewCount: 2100,
      description: "Médium experiente com dom natural para comunicação com o plano espiritual",
      pricePerMinute: "4.20",
      status: "online",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ]);
});

// === TESTIMONIALS ENDPOINTS ===

app.get('/api/testimonials', (req, res) => {
  res.json([
    {
      id: 1,
      userName: "Carolina M.",
      rating: 5,
      comment: "Consulta incrível! A Maria foi muito precisa e me ajudou muito com suas orientações.",
      consultantName: "Maria Silva",
      date: "2025-01-28",
      verified: true
    },
    {
      id: 2,
      userName: "Roberto S.",
      rating: 5,
      comment: "Excelente profissional. João me trouxe clareza sobre questões importantes da minha vida.",
      consultantName: "João Santos",
      date: "2025-01-27",
      verified: true
    },
    {
      id: 3,
      userName: "Fernanda L.",
      rating: 5,
      comment: "Ana é fantástica! Suas mensagens são sempre reconfortantes e precisas.",
      consultantName: "Ana Costa",
      date: "2025-01-26",
      verified: true
    }
  ]);
});

// === BLOG ENDPOINTS ===

app.get('/api/blog/recent', (req, res) => {
  res.json([
    {
      id: 1,
      title: "Como interpretar os sonhos: Guia completo",
      excerpt: "Descubra os significados ocultos dos seus sonhos e como eles podem orientar sua vida.",
      author: "Equipe Conselhos Esotéricos",
      publishedAt: "2025-01-28",
      readTime: "5 min",
      category: "Esoterismo",
      image: "/images/blog/sonhos.jpg",
      slug: "como-interpretar-sonhos-guia-completo"
    },
    {
      id: 2,
      title: "Os cristais e suas propriedades energéticas",
      excerpt: "Conheça os principais cristais e como utilizá-los para harmonizar suas energias.",
      author: "Maria Silva",
      publishedAt: "2025-01-25",
      readTime: "8 min",
      category: "Cristais",
      image: "/images/blog/cristais.jpg",
      slug: "cristais-propriedades-energeticas"
    },
    {
      id: 3,
      title: "Numerologia: descobrindo seu número da sorte",
      excerpt: "Aprenda a calcular e interpretar os números que influenciam sua vida.",
      author: "João Santos",
      publishedAt: "2025-01-22",
      readTime: "6 min",
      category: "Numerologia",
      image: "/images/blog/numerologia.jpg",
      slug: "numerologia-numero-da-sorte"
    }
  ]);
});

// === CPF CONSULTATION ===

app.post('/api/cpf/consulta', async (req, res) => {
  const { cpf } = req.body;
  
  if (!cpf || cpf.length !== 11) {
    return res.status(400).json({
      success: false,
      message: 'CPF deve ter 11 dígitos'
    });
  }

  try {
    console.log('🔍 Consultando CPF:', cpf);
    
    // Simulação de dados baseados no CPF para desenvolvimento
    const nomes = [
      'João Silva Santos', 'Maria Oliveira Costa', 'José Pereira Lima',
      'Ana Carolina Souza', 'Pedro Henrique Alves', 'Juliana Ferreira',
      'Carlos Eduardo Rocha', 'Beatriz Almeida Nunes', 'Ricardo Martins',
      'Fernanda Ribeiro Cruz'
    ];
    
    const nome = nomes[parseInt(cpf.substr(0, 2)) % nomes.length];
    
    // Simula delay de consulta real
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return res.json({
      success: true,
      data: {
        nome: nome,
        cpf: cpf,
        nascimento: '01/01/1990',
        situacao: 'Regular'
      }
    });
    
  } catch (error) {
    console.error('Erro na consulta CPF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

// Initialize and start server
const startServer = async () => {
  await initDB();
  
  if (process.env.NODE_ENV === 'production') {
    // For Vercel, we don't start the server here
    console.log('🚀 Server ready for Vercel deployment');
  } else {
    // For local development
    app.listen(PORT, () => {
      console.log(`🌙 Conselhos Esotéricos running on http://localhost:${PORT}`);
    });
  }
};

// Export for Vercel
export default app;

// Start server for local development
if (process.env.NODE_ENV !== 'production') {
  startServer();
}
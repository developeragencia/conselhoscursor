import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Types
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role: string;
  phone: string;
  cpf: string;
  credits: string;
  is_active: boolean;
  created_at: Date;
}

interface Consultant {
  id: string;
  slug: string;
  name: string;
  title?: string;
  specialty?: string;
  description?: string;
  price_per_minute: number;
  rating: number;
  review_count: number;
  status: string;
  image_url?: string;
  created_at: Date;
}

interface Message {
  id: string;
  consultation_id: string;
  sender_type: 'user' | 'consultant';
  content: string;
  created_at: Date;
}

interface Consultation {
  id: string;
  user_id: string;
  consultant_id: string;
  started_at: Date;
  ended_at?: Date;
  status: 'active' | 'ended' | 'cancelled';
  price_per_minute_snapshot: number;
  total_charged: number;
  created_at: Date;
}

interface ConsultationRoom {
  userWs?: WebSocket;
  consultantWs?: WebSocket;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

// WebSocket Server
const wss = new WebSocketServer({ server });
const activeConnections = new Map<string, WebSocket>(); // userId -> WebSocket
const consultationRooms = new Map<string, ConsultationRoom>(); // consultationId -> { userWs, consultantWs }

// Database connection
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Preview-Update', Date.now().toString());
  console.log(`🔥 Request: ${req.method} ${req.path} - Anti-cache: ${Date.now()}`);
  next();
});

app.use(express.static(path.join(__dirname, 'dist/public')));

// Storage
let db: Pool | null = null;
const users = new Map<string, User>();

// Database initialization
const initDatabase = async () => {
  try {
    if (process.env.DATABASE_URL) {
      db = new Pool(dbConfig);
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
      
      console.log('Database initialized successfully');
    } else {
      console.log('Memory mode - No database URL provided');
    }
  } catch (e) {
    console.error('Database initialization error:', e);
    console.log('Memory fallback mode activated');
    db = null;
  }
};

// Routes
app.get('*', (req, res) => {
  const jsx = (
    <html>
      <head>
        <title>Conselhos Esotéricos</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div id="root"></div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  );

  const html = renderToString(jsx);
  res.send(`<!DOCTYPE html>${html}`);
});

// Initialize and start server
const startServer = async () => {
  await initDatabase();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Conselhos Esotéricos running at http://localhost:${PORT}`);
    console.log(`WebSocket Server at ws://localhost:${PORT}`);
    console.log('Server running in production mode');
  });
};

startServer().catch(console.error);

export default app;
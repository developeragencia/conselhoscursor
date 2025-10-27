/**
 * Rate Limiting Middleware
 * Protege contra abuso de API e ataques DDoS
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Limpar store a cada hora
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 60 * 1000); // 1 hora

export function createRateLimiter(options: {
  windowMs: number; // Janela de tempo em ms
  max: number; // Máximo de requisições
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > options.max) {
      return res.status(429).json({
        error: options.message || 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }

    next();
  };
}

// Rate limiters específicos
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Limite de requisições excedido. Aguarde 15 minutos.'
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login
  message: 'Muitas tentativas de login. Aguarde 15 minutos.'
});

export const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 requisições por minuto
  message: 'Limite de API excedido. Aguarde 1 minuto.'
});


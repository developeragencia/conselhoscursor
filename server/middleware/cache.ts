/**
 * Sistema de Cache em Memória
 * Melhora performance reduzindo queries ao banco
 */

import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache: Map<string, CacheEntry> = new Map();

// Limpar cache expirado a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  });
}, 5 * 60 * 1000);

export function createCache(ttl: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Só cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.path}:${JSON.stringify(req.query)}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`✅ Cache HIT: ${key}`);
      return res.json(cached.data);
    }

    // Override res.json para cachear a resposta
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
      console.log(`💾 Cache SET: ${key}`);
      return originalJson(data);
    };

    next();
  };
}

// Limpar cache por pattern
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    console.log('🗑️ Cache completamente limpo');
    return;
  }

  let cleared = 0;
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  });
  console.log(`🗑️ ${cleared} entradas de cache removidas com pattern: ${pattern}`);
}

// Cache específicos
export const consultantsCache = createCache(5 * 60 * 1000); // 5 minutos
export const statsCache = createCache(2 * 60 * 1000); // 2 minutos
export const profileCache = createCache(10 * 60 * 1000); // 10 minutos


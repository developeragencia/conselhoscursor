/**
 * API Client com Cache, Retry e Error Handling
 */

interface RequestOptions extends RequestInit {
  retry?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

// Limpar cache expirado
setInterval(() => {
  const now = Date.now();
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  });
}, 60000); // 1 minuto

export class APIError extends Error {
  statusCode: number;
  response?: Response;

  constructor(message: string, statusCode: number, response?: Response) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiClient<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    retry = 3,
    retryDelay = 1000,
    cache: useCache = false,
    cacheTTL = 60000,
    ...fetchOptions
  } = options;

  // Verificar cache
  if (useCache && fetchOptions.method === 'GET') {
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`✅ Cache HIT: ${url}`);
      return cached.data as T;
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retry; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new APIError(
          errorData.error || `Erro ${response.status}`,
          response.status,
          response
        );
      }

      const data = await response.json();

      // Cachear se solicitado
      if (useCache && fetchOptions.method === 'GET') {
        cache.set(url, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL
        });
        console.log(`💾 Cache SET: ${url}`);
      }

      return data as T;

    } catch (error) {
      lastError = error as Error;
      
      // Não fazer retry em erros 4xx (client errors)
      if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Se não é a última tentativa, aguarda e tenta novamente
      if (attempt < retry - 1) {
        console.warn(`⚠️ Tentativa ${attempt + 1} falhou. Tentando novamente em ${retryDelay}ms...`);
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw lastError || new Error('Falha na requisição');
}

// Funções helper
export const api = {
  get: <T = any>(url: string, options?: RequestOptions) => 
    apiClient<T>(url, { ...options, method: 'GET' }),
  
  post: <T = any>(url: string, data?: any, options?: RequestOptions) => 
    apiClient<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  
  put: <T = any>(url: string, data?: any, options?: RequestOptions) => 
    apiClient<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  
  delete: <T = any>(url: string, options?: RequestOptions) => 
    apiClient<T>(url, { ...options, method: 'DELETE' }),

  // Limpar cache
  clearCache: (pattern?: string) => {
    if (!pattern) {
      cache.clear();
      return;
    }
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  }
};


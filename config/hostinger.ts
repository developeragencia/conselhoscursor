interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];
}

interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  sessionSecret: string;
}

interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}

interface WebSocketConfig {
  path: string;
  pingInterval: number;
  pingTimeout: number;
}

interface SSLConfig {
  enabled: boolean;
  key?: string;
  cert?: string;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface HostingerConfig {
  database: DatabaseConfig;
  server: ServerConfig;
  auth: AuthConfig;
  upload: UploadConfig;
  websocket: WebSocketConfig;
  ssl: SSLConfig;
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
}

export const hostingerConfig: HostingerConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'conselhos_esotericos',
    port: parseInt(process.env.DB_PORT || '3306'),
  },
  
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || '0.0.0.0',
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()),
  },
  
  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'conselhos_secret_2025',
    jwtExpiresIn: '7d',
    sessionSecret: process.env.SESSION_SECRET || 'session_secret_2025',
  },
  
  // File upload settings for Hostinger
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadDir: '/home/u123456/public_html/uploads',
  },
  
  // WebSocket configuration
  websocket: {
    path: '/ws',
    pingInterval: 30000,
    pingTimeout: 5000,
  },
  
  // SSL/TLS configuration (if using Hostinger SSL)
  ssl: {
    enabled: process.env.NODE_ENV === 'production',
    key: process.env.SSL_KEY_PATH,
    cert: process.env.SSL_CERT_PATH,
  },
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  hostingerConfig.database.ssl = {
    rejectUnauthorized: false
  };
  
  hostingerConfig.server.corsOrigins = [
    'https://your-domain.com',
    'https://www.your-domain.com'
  ];
}

export default hostingerConfig;
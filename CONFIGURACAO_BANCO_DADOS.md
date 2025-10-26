# 🗄️ Configuração do Banco de Dados - Status Atual

## ✅ STATUS: CONECTADO

---

## 📊 Informações do Banco

### Neon PostgreSQL
- **Provider:** Neon Database
- **Projeto ID:** `royal-paper-66041902`
- **Branch:** `main`
- **Versão PostgreSQL:** 16
- **Região:** US East (N. Virginia)
- **SSL:** ✅ Habilitado (required)

### Connection String
```
postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Pooler
- **Endpoint:** `ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech`
- **Database:** `neondb`
- **User:** `neondb_owner`
- **Connection Pooling:** ✅ Ativo

---

## 🔗 Conexão no Render

### Variáveis Configuradas

```bash
DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEON_DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Status
- ✅ **DATABASE_URL** está configurada no Render
- ✅ **NEON_DATABASE_URL** está configurada no Render
- ✅ **SSL** está habilitado
- ✅ **Connection pooling** está ativo

---

## 📋 Tabelas Criadas

### 1. users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  cpf TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  credits DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. consultants
```sql
CREATE TABLE consultants (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  name TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  price_per_minute DECIMAL(10,2) DEFAULT 0.00,
  is_online BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  total_consultations INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. testimonials
```sql
CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  consultant_id TEXT REFERENCES consultants(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. credits_transactions
```sql
CREATE TABLE credits_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. consultations
```sql
CREATE TABLE consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  consultant_id TEXT REFERENCES consultants(id),
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. messages
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  consultation_id TEXT REFERENCES consultations(id),
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. blog_posts (Criado via API)
```sql
CREATE TABLE blog_posts (
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
);
```

### 8. blog_categories (Criado via API)
```sql
CREATE TABLE blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. blog_comments (Criado via API)
```sql
CREATE TABLE blog_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. notifications (Criado via API)
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 Verificação de Conexão

### Via API
```bash
curl https://conselhos-esotericos.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T...",
  "database": "connected"
}
```

### Via SQL (Neon Console)
```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar usuários
SELECT COUNT(*) FROM users;

-- Contar consultores
SELECT COUNT(*) FROM consultants;
```

---

## ⚙️ Configuração no Código

### server/database.ts
```typescript
export const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
  max: 20,                    // Pool máximo
  idleTimeoutMillis: 30000,   // 30 segundos
  connectionTimeoutMillis: 2000, // 2 segundos
};
```

### server/index.ts
```typescript
const initDB = async () => {
  if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    db = new Pool({ connectionString });
    
    // Testar conexão
    await db.query('SELECT NOW()');
    console.log('✅ Database connected');
    
    // Criar tabelas se não existirem
    await runMigrations();
  }
};
```

---

## 🔧 Comandos Úteis

### Conectar via psql
```bash
psql "postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Backup
```bash
pg_dump "postgresql://..." > backup.sql
```

### Restore
```bash
psql "postgresql://..." < backup.sql
```

### Verificar Tamanho do Banco
```sql
SELECT pg_size_pretty(pg_database_size('neondb'));
```

---

## 📊 Monitoramento

### Neon Console
- **URL:** https://console.neon.tech
- **Projeto:** royal-paper-66041902
- **Métricas:** CPU, RAM, Storage, Connections

### No Código
```javascript
// Health check automático
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'disconnected'
  });
});
```

---

## 🚨 Troubleshooting

### Erro: "connection timeout"
**Solução:**
```bash
# Verificar se DATABASE_URL está correto
echo $DATABASE_URL

# Verificar SSL
# URL deve conter: ?sslmode=require
```

### Erro: "authentication failed"
**Solução:**
```bash
# Verificar credenciais
# Verificar se o banco está ativo no Neon
# Verificar se o IP está permitido (Neon permite todos por padrão)
```

### Erro: "too many connections"
**Solução:**
```javascript
// Ajustar pool máximo em database.ts
max: 10, // Reduzir de 20 para 10
```

---

## ✅ Checklist de Validação

- [x] Banco de dados Neon criado
- [x] Tabelas criadas automaticamente
- [x] DATABASE_URL configurada no Render
- [x] SSL habilitado
- [x] Connection pooling ativo
- [x] Health check respondendo
- [x] Migrations executadas
- [ ] Dados iniciais inseridos (consultores, categorias)
- [ ] Backup configurado

---

## 📈 Próximos Passos

1. **Adicionar Dados Iniciais:**
   - Criar usuários de teste
   - Cadastrar consultores
   - Criar categorias do blog

2. **Configurar Backup:**
   - Schedule backup diário
   - Testar restore

3. **Monitoramento:**
   - Configurar alertas no Neon
   - Monitorar uso de recursos

4. **Otimização:**
   - Criar índices adicionais conforme necessário
   - Analisar queries lentas

---

**Status Final:** ✅ **BANCO DE DADOS CONECTADO E FUNCIONANDO**

**URL do Projeto:** https://conselhos-esotericos.onrender.com
**Dashboard Neon:** https://console.neon.tech/app/projects/royal-paper-66041902
**Dashboard Render:** https://dashboard.render.com/web/srv-d3v2qhbe5dus73a2vifg

---

*Última atualização: 26/10/2025*


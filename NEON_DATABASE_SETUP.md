# Configuração do Banco de Dados Neon PostgreSQL

## 📋 Informações do Projeto

- **ID do Projeto:** royal-paper-66041902
- **Nome:** Conselhosesotericos
- **Branch Principal:** production (br-dawn-dust-a47c61n4)
- **PostgreSQL:** Versão 17.5
- **Região:** us-east-1 (AWS)

## 🔐 String de Conexão

```
postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🛠️ Configuração no Projeto

### Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Arquivo de Configuração

O arquivo `server/database.ts` já está configurado para usar a variável `DATABASE_URL`.

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

1. **users** - Gerenciamento de usuários
   - id (TEXT, PRIMARY KEY)
   - email (TEXT, UNIQUE)
   - first_name, last_name (TEXT)
   - password_hash (TEXT)
   - role (TEXT)
   - phone, cpf (TEXT, opcional)
   - credits (DECIMAL)
   - is_active (BOOLEAN)
   - created_at (TIMESTAMP)

2. **consultants** - Cadastro de consultores
   - id (TEXT, PRIMARY KEY)
   - slug (TEXT, UNIQUE)
   - name, title, specialty (TEXT)
   - description (TEXT)
   - price_per_minute (DECIMAL)
   - rating (DECIMAL)
   - review_count (INTEGER)
   - status (TEXT)
   - image_url (TEXT)
   - created_at (TIMESTAMP)

3. **consultations** - Registro de consultas
   - id (TEXT, PRIMARY KEY)
   - user_id, consultant_id (TEXT)
   - started_at, ended_at (TIMESTAMP)
   - status (TEXT: 'active', 'ended', 'cancelled')
   - price_per_minute_snapshot (DECIMAL)
   - total_charged (DECIMAL)
   - created_at (TIMESTAMP)

4. **credits_transactions** - Histórico de transações
   - id (TEXT, PRIMARY KEY)
   - user_id (TEXT)
   - type (TEXT: 'add', 'debit')
   - amount (DECIMAL)
   - balance_after (DECIMAL)
   - reference_id (TEXT)
   - created_at (TIMESTAMP)

5. **messages** - Mensagens das consultas
   - id (TEXT, PRIMARY KEY)
   - consultation_id (TEXT)
   - sender_type (TEXT: 'user', 'consultant')
   - content (TEXT)
   - created_at (TIMESTAMP)

6. **testimonials** - Depoimentos de usuários
   - id (TEXT, PRIMARY KEY)
   - user_id, consultant_id (TEXT)
   - rating (INTEGER: 1-5)
   - comment (TEXT)
   - approved (BOOLEAN)
   - created_at (TIMESTAMP)

## 🚀 Como Usar

### Conectar ao Banco

```typescript
import { getPool } from './server/database';

const pool = await getPool();
const result = await pool.query('SELECT * FROM users');
```

### Executar Migrações

```bash
npm run db:migrate
```

### Verificar Conexão

```bash
npm run dev
```

## 📝 Notas Importantes

- ⚠️ **Segurança:** Nunca commite o arquivo `.env` com suas credenciais reais
- 🔒 **SSL:** A conexão usa SSL obrigatório (`sslmode=require`)
- 🌐 **Pooling:** O projeto está configurado para usar connection pooling
- 📈 **Escalabilidade:** O Neon oferece auto-scaling automático

## 🔗 Links Úteis

- [Dashboard Neon](https://console.neon.tech/app/projects/royal-paper-66041902)
- [Documentação Neon](https://neon.tech/docs/introduction)
- [PostgreSQL 17 Docs](https://www.postgresql.org/docs/17/)

## ✅ Status da Configuração

- [x] Projeto Neon criado
- [x] Branch de produção configurado
- [x] String de conexão obtida
- [x] Tabelas do banco criadas
- [x] Arquivo de configuração atualizado
- [x] Documentação criada

**Data da Configuração:** 26 de outubro de 2025


# 🔐 Configuração de Variáveis de Ambiente

## Como Configurar o Arquivo .env

Para configurar seu ambiente local, você precisa criar um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### 1️⃣ Crie o arquivo .env

No Windows PowerShell:
```powershell
New-Item -Path ".env" -ItemType File
```

Ou simplesmente crie manualmente o arquivo `.env` na raiz do projeto.

### 2️⃣ Adicione o Conteúdo

Copie e cole o seguinte conteúdo no arquivo `.env`:

```env
# ========================================
# DATABASE CONFIGURATION - NEON POSTGRESQL
# ========================================
DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# ========================================
# AUTHENTICATION
# ========================================
# Gere uma chave secreta forte para produção
JWT_SECRET=sua-chave-jwt-super-secreta-mude-em-producao
SESSION_SECRET=sua-chave-sessao-super-secreta-mude-em-producao

# ========================================
# GOOGLE OAUTH (Opcional)
# ========================================
# Configure apenas se for usar autenticação com Google
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# ========================================
# STRIPE PAYMENT (Opcional)
# ========================================
# Configure para pagamentos
STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave-publica-stripe
STRIPE_SECRET_KEY=sk_test_sua-chave-secreta-stripe
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret

# ========================================
# ANTHROPIC AI (Opcional)
# ========================================
# Para funcionalidades de IA
ANTHROPIC_API_KEY=sua-chave-anthropic

# ========================================
# SERVER CONFIGURATION
# ========================================
NODE_ENV=development
PORT=3000

# ========================================
# CORS
# ========================================
CORS_ORIGIN=http://localhost:3000

# ========================================
# DATABASE MIGRATIONS
# ========================================
DISABLE_DRIZZLE=false
NO_MIGRATIONS=false
```

### 3️⃣ Personalize as Variáveis

**⚠️ IMPORTANTE:** Antes de usar em produção, você deve:

1. **JWT_SECRET e SESSION_SECRET**: Gere chaves fortes e únicas
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Google OAuth**: Configure no [Google Cloud Console](https://console.cloud.google.com/)

3. **Stripe**: Obtenha suas chaves no [Stripe Dashboard](https://dashboard.stripe.com/)

4. **Anthropic AI**: Obtenha sua chave em [Anthropic Console](https://console.anthropic.com/)

### 4️⃣ Verifique a Configuração

Execute o projeto para testar:

```bash
npm run dev
```

Se a conexão com o banco estiver funcionando, você verá no console:
```
Database connection established
```

## 📋 Status Atual do Banco de Dados

- ✅ **Conexão**: Estabelecida e funcionando
- ✅ **Tabelas**: 6 tabelas criadas
  - users
  - consultants
  - consultations
  - credits_transactions
  - messages
  - testimonials
- 📊 **Dados**: Banco vazio (pronto para popular)

## 🔒 Segurança

⚠️ **NUNCA commite o arquivo `.env`** ao Git!

O arquivo já está incluído no `.gitignore`, mas sempre verifique antes de fazer commits.

## 🆘 Problemas Comuns

### Erro de Conexão

Se você receber erro de conexão SSL, verifique se:
- A URL contém `sslmode=require`
- Sua rede permite conexões externas na porta 5432

### Erro de Autenticação

Se receber erro de autenticação:
- Verifique se a senha na URL está correta
- Confirme que o usuário `neondb_owner` tem permissões

### Tabelas Não Encontradas

Se as tabelas não forem encontradas:
- Execute as migrações: `npm run db:migrate`
- Ou use o script de inicialização: `npm run db:push`

## 📞 Suporte

Para mais informações:
- Veja `NEON_DATABASE_SETUP.md` para detalhes técnicos
- Acesse o [Dashboard Neon](https://console.neon.tech/app/projects/royal-paper-66041902)
- Consulte a [Documentação do Projeto](./README.md)

---

**Última atualização:** 26 de outubro de 2025


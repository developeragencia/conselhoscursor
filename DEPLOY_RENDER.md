# 🚀 Guia Completo de Deploy no Render

Este guia contém todas as instruções necessárias para fazer o deploy do **Conselhos Esotéricos** no Render.

---

## 📋 Pré-requisitos

- [x] Conta no [Render](https://render.com/)
- [x] Repositório Git (GitHub, GitLab ou Bitbucket)
- [x] Banco de dados Neon PostgreSQL configurado
- [x] Node.js 18+ (para testes locais)

---

## 🗄️ Banco de Dados Neon

### Informações do Banco

O projeto já está configurado para usar o **Neon PostgreSQL**:

- **Projeto ID:** `royal-paper-66041902`
- **Nome do Projeto:** Conselhosesotericos
- **Branch:** production
- **PostgreSQL:** Versão 17.5
- **Região:** us-east-1 (AWS)

### String de Conexão

```
postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Tabelas Criadas

✅ As seguintes tabelas já foram criadas no banco:
- `users` - Usuários do sistema
- `consultants` - Consultores
- `consultations` - Consultas
- `credits_transactions` - Transações de créditos
- `messages` - Mensagens
- `testimonials` - Depoimentos

---

## 🎯 Configuração do Render

### Passo 1: Conectar Repositório

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório Git
4. Selecione o repositório do projeto

### Passo 2: Configurações Básicas

Configure os seguintes campos:

| Campo | Valor |
|-------|-------|
| **Name** | `conselhos-esotericos` |
| **Region** | Oregon (US West) ou qualquer outra |
| **Branch** | `main` ou `master` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node server/index.js` |

### Passo 3: Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Render:

#### Obrigatórias

```env
# Node Environment
NODE_ENV=production

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT e Sessões (gerar chaves seguras)
JWT_SECRET=sua-chave-secreta-jwt-aqui
SESSION_SECRET=sua-chave-secreta-sessao-aqui

# Server
PORT=10000

# CORS
ALLOWED_ORIGINS=https://conselhos-esotericos.onrender.com
CORS_ORIGIN=https://conselhos-esotericos.onrender.com
```

#### Opcionais (Configure conforme necessário)

```env
# Anthropic AI (para funcionalidades de IA)
ANTHROPIC_API_KEY=sua-chave-anthropic

# Stripe (para pagamentos)
STRIPE_SECRET_KEY=sk_live_sua-chave-stripe
STRIPE_PUBLISHABLE_KEY=pk_live_sua-chave-publica-stripe
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret

# Google OAuth (para login com Google)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### Passo 4: Configurações Avançadas

1. **Health Check Path:** `/api/health`
2. **Auto-Deploy:** ✅ Ativado (deploy automático em cada push)

---

## 🔐 Gerando Chaves Seguras

### JWT_SECRET e SESSION_SECRET

Execute no terminal para gerar chaves seguras:

```bash
# Para JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Para SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie as chaves geradas e adicione nas variáveis de ambiente do Render.

---

## 📦 Estrutura do Projeto

### Arquivos Principais

```
conselho01/
├── server/
│   ├── index.ts          # Servidor principal
│   ├── server.tsx        # Servidor alternativo com WebSocket
│   ├── database.ts       # Configuração do banco de dados
│   ├── websocket.ts      # Servidor WebSocket
│   └── tsconfig.json     # Configuração TypeScript
├── client/               # Frontend React
├── dist/                 # Build de produção (gerado)
├── package.json          # Dependências e scripts
├── render.yaml           # Configuração Blueprint do Render
├── vite.config.ts        # Configuração Vite
└── tsconfig.json         # TypeScript config global
```

### Scripts NPM

```json
{
  "dev": "Modo desenvolvimento local",
  "build": "Build completo (client + server)",
  "build:client": "Build do frontend",
  "build:server": "Build do backend",
  "start": "Inicia servidor em produção",
  "db:migrate": "Executa migrações do banco"
}
```

---

## 🔄 Deploy Usando Blueprint (Automático)

### Opção 1: Deploy via Blueprint

O projeto inclui um arquivo `render.yaml` que automatiza o deploy:

1. No Dashboard do Render, clique em **"New +"** → **"Blueprint"**
2. Conecte seu repositório
3. O Render detectará automaticamente o `render.yaml`
4. Configure apenas as variáveis de ambiente marcadas como `sync: false`
5. Clique em **"Apply"**

### Opção 2: Deploy Manual

Siga os passos da seção "Configuração do Render" acima.

---

## ✅ Verificação do Deploy

### 1. Verificar Health Check

Após o deploy, acesse:
```
https://seu-app.onrender.com/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T13:00:00.000Z",
  "database": "connected"
}
```

### 2. Verificar Logs

No Dashboard do Render:
1. Acesse seu serviço
2. Vá em **"Logs"**
3. Procure por:
   - ✅ `Database initialized successfully`
   - ✅ `Server running on port 10000`
   - ❌ Erros de conexão ou build

### 3. Testar Endpoints

```bash
# Health Check
curl https://seu-app.onrender.com/api/health

# Consultores em destaque
curl https://seu-app.onrender.com/api/consultants/featured

# Blog posts recentes
curl https://seu-app.onrender.com/api/blog/recent
```

---

## 🐛 Troubleshooting

### Problema: Erro de Build

**Sintomas:** Build falha com erros de TypeScript ou dependências

**Solução:**
```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Erro de Conexão com Banco

**Sintomas:** `database: "disconnected"` no health check

**Solução:**
1. Verifique se `DATABASE_URL` está configurada corretamente
2. Confirme que a URL inclui `?sslmode=require`
3. Teste a conexão no [Neon Dashboard](https://console.neon.tech/)

### Problema: CORS Error

**Sintomas:** Frontend não consegue fazer requisições

**Solução:**
1. Configure `ALLOWED_ORIGINS` com a URL do seu app:
   ```
   ALLOWED_ORIGINS=https://seu-app.onrender.com
   ```
2. Se usar múltiplas origens, separe com vírgulas:
   ```
   ALLOWED_ORIGINS=https://app1.com,https://app2.com
   ```

### Problema: 503 Service Unavailable

**Sintomas:** App fica offline após período inativo (Free Tier)

**Solução:**
- No plano Free, o Render coloca serviços inativos em sleep após 15 minutos
- Primeira requisição após sleep demora ~30 segundos
- Considere upgrade para plano pago se precisar de uptime 100%

---

## 🔄 Atualizações e Re-Deploy

### Deploy Automático

Com auto-deploy ativado, cada push para a branch principal dispara um novo deploy.

### Deploy Manual

1. Acesse o Dashboard do Render
2. Vá em seu serviço
3. Clique em **"Manual Deploy"** → **"Deploy latest commit"**

### Rollback

Para voltar a uma versão anterior:
1. Acesse **"Events"** no seu serviço
2. Encontre o deploy desejado
3. Clique em **"Rollback to this version"**

---

## 📊 Monitoramento

### Métricas Disponíveis

No Dashboard do Render:
- CPU Usage
- Memory Usage
- Response Time
- Request Count
- Error Rate

### Logs em Tempo Real

```bash
# Via Render CLI (opcional)
render logs -f
```

---

## 💰 Custos

### Free Tier Limits

- ✅ 750 horas/mês gratuitas
- ✅ Auto-sleep após 15 min de inatividade
- ✅ 512 MB RAM
- ✅ 0.1 CPU

### Planos Pagos

- **Starter:** $7/mês - Sem sleep, 512 MB RAM
- **Standard:** $25/mês - 2 GB RAM, melhor performance
- **Pro:** $85/mês - 4 GB RAM, prioridade de suporte

---

## 🔗 Links Úteis

- [Render Dashboard](https://dashboard.render.com/)
- [Neon Console](https://console.neon.tech/app/projects/royal-paper-66041902)
- [Documentação Render](https://render.com/docs)
- [Documentação Neon](https://neon.tech/docs)

---

## 📝 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Banco de dados Neon conectado e tabelas criadas
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado sem erros
- [ ] Health check retornando `status: "ok"`
- [ ] Frontend carregando corretamente
- [ ] API endpoints respondendo
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS funcionando
- [ ] Logs sem erros críticos

---

## 🎉 Deploy Concluído!

Se todos os itens acima estão ✅, seu app está no ar!

Acesse: `https://seu-app.onrender.com`

---

**Última atualização:** 26 de outubro de 2025  
**Versão:** 1.0  
**Banco de Dados:** Neon PostgreSQL (royal-paper-66041902)


# 🚀 Guia Rápido de Deploy

## ⚡ Deploy em 10 Passos

### 1. Preparar Variáveis de Ambiente
Crie um arquivo com estas variáveis (não commitar!):

```bash
# === BANCO DE DADOS (Neon) ===
DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# === SEGURANÇA ===
JWT_SECRET=gerar_com_openssl_rand_base64_32
SESSION_SECRET=gerar_com_openssl_rand_base64_32

# === STRIPE (Pagamentos) ===
STRIPE_SECRET_KEY=sk_test_...  # Pegar no dashboard Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Pegar no dashboard Stripe
STRIPE_WEBHOOK_SECRET=whsec_...  # Configurar após deploy

# === CORS ===
ALLOWED_ORIGINS=https://seu-app.onrender.com
CORS_ORIGIN=https://seu-app.onrender.com

# === APLICAÇÃO ===
NODE_ENV=production
PORT=10000
```

### 2. Criar Conta no Render
1. Acesse https://render.com
2. Crie uma conta (GitHub recomendado)
3. Confirme seu e-mail

### 3. Conectar Repositório
1. Push seu código para GitHub
2. No Render, clique em "New +"
3. Selecione "Web Service"
4. Conecte seu repositório

### 4. Configurar Serviço
```yaml
Nome: conselhos-esotericos
Runtime: Node
Branch: main
Build Command: npm ci && npm run build
Start Command: node server/index.js
Plan: Free (ou Starter)
Region: Oregon
```

### 5. Adicionar Variáveis de Ambiente
No Render Dashboard:
1. Vá em "Environment"
2. Clique em "Add Environment Variable"
3. Adicione TODAS as variáveis do passo 1

**⚠️ IMPORTANTE:** Gere secrets únicos:
```bash
# No terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Deploy Inicial
1. Clique em "Create Web Service"
2. Aguarde o build (5-10 minutos)
3. Verifique os logs
4. Acesse a URL gerada

### 7. Configurar Webhook Stripe
1. Acesse https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-app.onrender.com/api/payments/webhook`
4. Selecione eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o `Signing secret`
6. Adicione como `STRIPE_WEBHOOK_SECRET` no Render

### 8. Testar Health Check
```bash
curl https://seu-app.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### 9. Testar Funcionalidades
✅ Registrar usuário
✅ Fazer login
✅ Ver consultores
✅ Testar pagamento (modo teste)
✅ Enviar mensagem no chat

### 10. Configurar Domínio (Opcional)
1. No Render: Settings → Custom Domain
2. Adicione seu domínio
3. Configure DNS (CNAME ou A record)
4. Atualize `ALLOWED_ORIGINS` e `CORS_ORIGIN`

---

## 🐛 Solução de Problemas

### Build Falhou
```bash
# Verificar logs no Render
# Comum: falta de memória ou timeout

Solução:
- Upgrade para plano Starter ($7/mês)
- Ou simplificar build removendo sourcemaps
```

### Database não conecta
```bash
Erro: "connection timeout"

Solução:
1. Verificar DATABASE_URL está correto
2. Confirmar SSL está habilitado
3. Testar conexão com: psql $DATABASE_URL
```

### WebSocket não funciona
```bash
Erro: "WebSocket connection failed"

Solução:
1. Verificar HTTP server está criado (createServer)
2. Confirmar porta está correta
3. Usar wss:// em produção (não ws://)
```

### Stripe webhook falha
```bash
Erro: "webhook signature verification failed"

Solução:
1. Verificar STRIPE_WEBHOOK_SECRET está correto
2. Confirmar endpoint URL está exata
3. Testar com Stripe CLI localmente primeiro
```

---

## 📊 Monitoramento Pós-Deploy

### Logs em Tempo Real
```bash
# No Render Dashboard
Logs → Live Logs
```

### Métricas
```bash
Metrics → CPU, Memory, Requests
```

### Alertas
```bash
Settings → Notifications
# Configurar email para alertas
```

---

## 🔒 Checklist de Segurança

- [ ] JWT_SECRET único e forte (32+ chars)
- [ ] SESSION_SECRET único e forte
- [ ] STRIPE_SECRET_KEY no modo correto (test/live)
- [ ] CORS configurado apenas para seu domínio
- [ ] HTTPS ativado (automático no Render)
- [ ] Variáveis de ambiente não no código
- [ ] Senhas hashadas (bcrypt - já implementado)
- [ ] Rate limiting ativado (adicionar futuramente)

---

## 💰 Custos Estimados

### Render
- **Free Plan:** $0/mês
  - 750h/mês (suficiente para 1 serviço)
  - 512MB RAM
  - Sleep após 15min inatividade
  
- **Starter Plan:** $7/mês (recomendado)
  - Always on
  - 512MB RAM
  - Sem sleep

### Neon Database
- **Free Tier:** $0/mês
  - 3GB storage
  - 100h compute/mês
  
- **Scale:** $19/mês
  - Unlimited compute
  - 10GB storage

### Stripe
- **Grátis** para usar
- Taxa por transação: 3.5% + R$0.39

**💡 Recomendação inicial:** Render Starter + Neon Free = $7/mês

---

## 📈 Próximas Otimizações

### Curto Prazo
1. [ ] Adicionar Redis para cache
2. [ ] Implementar rate limiting
3. [ ] Configurar CDN para assets
4. [ ] Adicionar monitoring (Sentry)

### Médio Prazo
1. [ ] Implementar CI/CD automático
2. [ ] Adicionar testes automatizados
3. [ ] Configurar backups automáticos
4. [ ] Implementar queue system (Bull)

### Longo Prazo
1. [ ] Migrar para Kubernetes
2. [ ] Implementar microserviços
3. [ ] Adicionar região secundária
4. [ ] Implementar disaster recovery

---

## 🎯 Comandos Úteis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção local
npm start

# Verificar tipos TypeScript
npm run check
```

### Banco de Dados
```bash
# Conectar ao Neon
psql $DATABASE_URL

# Ver tabelas
\dt

# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Stripe
```bash
# Testar webhook localmente
stripe listen --forward-to localhost:5000/api/payments/webhook

# Trigger evento de teste
stripe trigger payment_intent.succeeded
```

---

## ✅ Pronto!

Seu sistema **Conselhos Esotéricos** está no ar! 🎉

**URLs Importantes:**
- 🌐 App: https://seu-app.onrender.com
- 📊 Dashboard Render: https://dashboard.render.com
- 💳 Dashboard Stripe: https://dashboard.stripe.com
- 🗄️ Dashboard Neon: https://console.neon.tech

**Suporte:**
- 📧 Render: support@render.com
- 💬 Stripe: https://support.stripe.com
- 🗃️ Neon: support@neon.tech

---

**Desenvolvido com 💜**


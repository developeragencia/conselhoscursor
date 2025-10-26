# 🌙 Conselhos Esotéricos

> Plataforma profissional de consultas esotéricas em tempo real

[![Status](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192)](https://neon.tech/)

---

## 📖 Sobre o Projeto

Sistema completo para conectar pessoas com consultores esotéricos, oferecendo consultas em tempo real via chat, sistema de pagamentos integrado, blog de conteúdo e painel administrativo.

### ✨ Principais Funcionalidades

- 💬 **Chat em Tempo Real** - WebSocket para comunicação instantânea
- 💳 **Pagamentos Integrados** - Stripe (cartão) + PIX ready
- 🔮 **Gestão de Consultores** - Perfis, avaliações e especialidades
- 💰 **Sistema de Créditos** - Recarga, débito e transferência
- 📝 **Blog CMS** - Sistema completo de publicação de conteúdo
- 👨‍💼 **Painel Admin** - Gestão centralizada do sistema
- 🔔 **Notificações** - Push notifications em tempo real
- 🔒 **Segurança** - JWT, bcrypt, CORS, SSL/TLS

---

## 🚀 Quick Start

### Pré-requisitos

```bash
Node.js 20+
PostgreSQL (Neon)
npm ou yarn
```

### Instalação

```bash
# 1. Clone o repositório
git clone [seu-repo]
cd conselho01

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:5000

---

## 📁 Estrutura do Projeto

```
conselho01/
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Componentes React
│       ├── hooks/          # Hooks customizados
│       ├── pages/          # Páginas da aplicação
│       └── lib/            # Utilitários
│
├── server/                 # Backend Node.js
│   ├── routes/             # Rotas da API
│   │   ├── admin.ts
│   │   ├── blog.ts
│   │   ├── consultants.ts
│   │   ├── consultations.ts
│   │   ├── credits.ts
│   │   ├── notifications.ts
│   │   ├── payments.ts
│   │   └── testimonials.ts
│   ├── index.ts            # Servidor principal
│   ├── database.ts         # Configuração do DB
│   └── websocket-handler.ts # Handler WebSocket
│
└── docs/                   # Documentação
    ├── NEON_DATABASE_SETUP.md
    ├── DEPLOY_RENDER.md
    ├── GUIA_RAPIDO_DEPLOY.md
    └── ...
```

---

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run check            # Verifica tipos TypeScript

# Build
npm run build            # Build completo (client + server)
npm run build:client     # Build apenas do frontend
npm run build:server     # Build apenas do backend

# Produção
npm start                # Inicia servidor de produção

# Banco de Dados
npm run db:push          # Sincroniza schema com DB
npm run db:migrate       # Executa migrations
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **consultants** - Dados dos consultores
- **consultations** - Consultas realizadas
- **messages** - Mensagens do chat
- **credits_transactions** - Histórico de créditos
- **testimonials** - Depoimentos
- **blog_posts** - Posts do blog
- **blog_categories** - Categorias do blog
- **blog_comments** - Comentários
- **notifications** - Notificações

### Conexão

O projeto usa **Neon** (PostgreSQL serverless) com connection pooling automático.

---

## 🔐 Variáveis de Ambiente

Criar arquivo `.env.local`:

```bash
# Banco de Dados
DATABASE_URL=postgresql://...
NEON_DATABASE_URL=postgresql://...

# Autenticação
JWT_SECRET=seu_secret_aqui
SESSION_SECRET=seu_session_secret

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
ALLOWED_ORIGINS=http://localhost:5000
CORS_ORIGIN=http://localhost:5000

# App
NODE_ENV=development
PORT=5000
```

**📝 Nota:** Veja `CONFIGURACAO_ENV.md` para detalhes completos.

---

## 🌐 API Endpoints

### Autenticação
```
POST /api/auth/register    - Registrar novo usuário
POST /api/auth/login       - Login
GET  /api/auth/me          - Dados do usuário atual
```

### Consultores
```
GET  /api/consultants                 - Listar consultores
GET  /api/consultants/featured        - Consultores em destaque
GET  /api/consultants/:id             - Detalhes do consultor
```

### Consultas
```
POST /api/consultations/start         - Iniciar consulta
POST /api/consultations/:id/end       - Finalizar consulta
GET  /api/consultations/:id/messages  - Mensagens da consulta
GET  /api/consultations/history       - Histórico
```

### Pagamentos
```
GET  /api/payments/config                   - Config Stripe
POST /api/payments/create-payment-intent    - Criar pagamento
POST /api/payments/webhook                  - Webhook Stripe
GET  /api/payments/history                  - Histórico
```

### Blog
```
GET  /api/blog/posts           - Listar posts
GET  /api/blog/posts/:slug     - Post por slug
POST /api/blog/posts           - Criar post (admin)
GET  /api/blog/categories      - Categorias
```

**📝 Nota:** Veja documentação completa em `SISTEMA_COMPLETO_PRODUCAO.md`.

---

## 🎨 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL (Neon)** - Banco de dados
- **WebSocket (ws)** - Comunicação tempo real
- **JWT** - Autenticação
- **Stripe** - Pagamentos
- **bcrypt** - Hash de senhas

### Frontend
- **React 18** - UI Library
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Wouter** - Roteamento
- **Lucide React** - Ícones
- **Vite** - Build tool

---

## 🚀 Deploy

### Render (Recomendado)

```bash
# 1. Conecte o repositório no Render
# 2. Configure as variáveis de ambiente
# 3. Use os comandos:

Build Command:  npm ci && npm run build
Start Command:  node server/index.js
```

**📝 Guia completo:** Veja `GUIA_RAPIDO_DEPLOY.md` para instruções passo a passo.

### Custo Estimado
- **Render Starter:** $7/mês
- **Neon Free:** $0/mês
- **Total:** $7/mês

---

## 📊 Status do Projeto

### ✅ Completo
- [x] Autenticação e autorização
- [x] Sistema de consultores
- [x] Chat em tempo real
- [x] Sistema de pagamentos
- [x] Gestão de créditos
- [x] Blog CMS
- [x] Painel administrativo
- [x] Notificações
- [x] Deploy configurado
- [x] Documentação completa

### 🔄 Opcional (Melhorias Futuras)
- [ ] App mobile (React Native)
- [ ] Notificações por email
- [ ] Sistema de afiliados
- [ ] Programa de fidelidade
- [ ] Múltiplos idiomas

---

## 📚 Documentação

### Guias Técnicos
- 📖 [Setup do Banco de Dados](NEON_DATABASE_SETUP.md)
- 🚀 [Deploy no Render](DEPLOY_RENDER.md)
- ⚡ [Guia Rápido de Deploy](GUIA_RAPIDO_DEPLOY.md)
- 🏗️ [Estrutura do Projeto](PROJETO_LIMPO_RENDER.md)

### Resumos Executivos
- 📊 [Sistema Completo](SISTEMA_COMPLETO_PRODUCAO.md)
- 💡 [Melhorias Implementadas](MELHORIAS_IMPLEMENTADAS.md)
- 🎯 [Resumo Executivo Final](RESUMO_EXECUTIVO_FINAL.md)

---

## 🔒 Segurança

O projeto implementa:

- ✅ Autenticação JWT com refresh tokens
- ✅ Senhas hashadas com bcrypt (salt rounds: 10)
- ✅ CORS configurado
- ✅ SQL injection protegido (queries parametrizadas)
- ✅ XSS protegido
- ✅ Rate limiting preparado
- ✅ HTTPS obrigatório em produção
- ✅ Validação de entrada de dados
- ✅ Tokens com expiração

---

## 🤝 Contribuindo

Este é um projeto privado. Para sugestões ou reportar bugs, entre em contato com a equipe de desenvolvimento.

---

## 📝 License

MIT License - veja arquivo LICENSE para detalhes.

---

## 👥 Equipe

Desenvolvido com 💜 pela equipe Conselhos Esotéricos.

---

## 📞 Suporte

- 📧 Email: [seu-email]
- 💬 Discord: [seu-discord]
- 🐛 Issues: [seu-github]/issues

---

## 🎯 Roadmap

### Q1 2026
- [ ] Launch inicial
- [ ] Onboarding de consultores
- [ ] Marketing digital
- [ ] SEO optimization

### Q2 2026
- [ ] App mobile (iOS + Android)
- [ ] Integração com mais gateways de pagamento
- [ ] Sistema de avaliações expandido
- [ ] Analytics avançado

### Q3 2026
- [ ] Sistema de afiliados
- [ ] Programa de fidelidade
- [ ] Expansão de conteúdo (cursos)
- [ ] API pública

---

<div align="center">

**🌙 Conectando pessoas com orientação espiritual de qualidade 💜**

[Website](#) • [Documentação](#) • [Blog](#)

</div>

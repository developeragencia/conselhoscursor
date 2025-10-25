# Deploy no Render - Conselhos Esotéricos

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Conta no [Neon](https://neon.tech) para PostgreSQL (ou use o PostgreSQL do Render)
3. Repositório Git com o código

## 🚀 Passos para Deploy

### 1. Criar Web Service no Render

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório Git
4. Configure o serviço:
   - **Name**: `conselhos-esotericos`
   - **Runtime**: `Node`
   - **Region**: Escolha a região mais próxima (ex: `Oregon (US West)`)
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: deixe vazio
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: `Free` ou conforme necessário

### 2. Configurar Variáveis de Ambiente

No Render, vá em **Environment** e adicione as seguintes variáveis:

#### Obrigatórias:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=sua-connection-string-postgresql
JWT_SECRET=seu-jwt-secret-aleatorio-seguro
```

#### Opcionais:
```
ALLOWED_ORIGINS=https://seu-dominio.onrender.com
CORS_ORIGIN=https://seu-dominio.onrender.com
```

### 3. Banco de Dados PostgreSQL

#### Opção A: Usar PostgreSQL do Render
1. No Dashboard, clique em **"New +"** → **"PostgreSQL"**
2. Configure o banco de dados
3. Copie a **Connection String** e cole em `DATABASE_URL`

#### Opção B: Usar Neon (Recomendado - mais rápido)
1. Crie um projeto no [Neon](https://neon.tech)
2. Copie a **Connection String** (com SSL)
3. Cole em `DATABASE_URL`

### 4. Build e Deploy

1. Clique em **"Create Web Service"**
2. O Render irá automaticamente:
   - Instalar dependências (`npm install`)
   - Fazer build do cliente e servidor (`npm run build`)
   - Iniciar o servidor (`node dist/index.js`)

### 5. Verificar Deploy

Após o deploy:
- Acesse a URL fornecida: `https://seu-app.onrender.com`
- Verifique os logs em **Logs** no dashboard
- Teste o registro e login de usuários

## 🔧 Comandos de Build

```bash
# Build completo (cliente + servidor)
npm run build

# Build apenas do cliente
npm run build:client

# Build apenas do servidor
npm run build:server
```

## 📁 Estrutura de Build

Após o build, os arquivos estarão em:
```
dist/
├── public/           # Frontend (Vite build)
│   ├── index.html
│   └── assets/
├── index.js          # Servidor principal
├── server.js         # Servidor alternativo com SSR
├── websocket.js      # WebSocket server
└── database.js       # Configuração de BD
```

## 🔒 Segurança

- ✅ CORS configurado para permitir apenas domínios específicos
- ✅ Senhas hasheadas com bcrypt
- ✅ JWT para autenticação
- ✅ SSL/TLS automático no Render
- ✅ Conexão segura com PostgreSQL

## 🗄️ Banco de Dados

O servidor cria automaticamente as tabelas necessárias na primeira execução:
- `users` - Usuários (clientes e consultores)
- `credits_transactions` - Transações de créditos
- `consultations` - Consultas realizadas
- `messages` - Mensagens das consultas
- `testimonials` - Avaliações e depoimentos
- `consultants` - Dados dos consultores

## 🌐 URLs e Endpoints

### Frontend
- `/` - Página inicial
- `/login` - Login
- `/cadastro` - Cadastro
- `/consultores` - Lista de consultores
- `/tarot-gratis` - Tarot gratuito

### API Backend
- `GET /api/health` - Health check
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Dados do usuário
- `GET /api/credits/balance` - Saldo de créditos
- `GET /api/consultants/featured` - Consultores em destaque
- `GET /api/testimonials` - Depoimentos
- `GET /api/blog/recent` - Posts recentes do blog
- `POST /api/cpf/consulta` - Consulta de CPF

## 🐛 Troubleshooting

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está correta
- Certifique-se que o IP do Render está autorizado no Neon/PostgreSQL

### Erro: "Module not found"
- Execute `npm install` localmente
- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)

### Erro: "Port already in use"
- O Render define automaticamente a variável `PORT`
- Não é necessário definir manualmente

### Aplicação não carrega o frontend
- Verifique se o build foi executado: `npm run build`
- Confira se existe `dist/public/index.html`
- Veja os logs no Render Dashboard

## 📊 Monitoramento

No Render Dashboard, você pode:
- Ver logs em tempo real
- Monitorar uso de recursos
- Configurar health checks
- Ver métricas de desempenho

## 🔄 Atualização

Para atualizar o deploy:
1. Faça push para o repositório Git
2. O Render detectará automaticamente
3. Fará rebuild e redeploy automaticamente

Ou force um redeploy:
1. Vá em **Settings** no Dashboard
2. Clique em **Manual Deploy** → **Deploy latest commit**

## 💰 Custos

- **Free Tier**: Adequado para testes e projetos pessoais
  - 750 horas/mês de runtime
  - 512MB RAM
  - 0.1 CPU
  
- **Starter**: $7/mês
  - Runtime ilimitado
  - 512MB RAM
  - 0.5 CPU

## 📞 Suporte

- [Documentação Render](https://render.com/docs)
- [Documentação Neon](https://neon.tech/docs)
- [Community Forum](https://community.render.com)

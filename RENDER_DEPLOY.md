# 🚀 Guia de Deploy no Render

## Pré-requisitos
- Conta no Render (https://render.com)
- Repositório Git com o código do projeto

## 📋 Passo a Passo

### 1. Criar PostgreSQL Database

1. No dashboard do Render, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `conselhos-esotericos-db`
   - **Database**: `conselhos_db`
   - **User**: (deixe o padrão)
   - **Region**: escolha a mais próxima (US East recomendado)
   - **PostgreSQL Version**: 15 ou superior
   - **Plan**: Free (ou Starter para produção)
3. Clique em **"Create Database"**
4. **IMPORTANTE**: Copie o **Internal Database URL** - você vai precisar!

### 2. Criar Web Service

1. No dashboard, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório Git
3. Configure:
   - **Name**: `conselhos-esotericos`
   - **Region**: mesma do banco de dados
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: (deixe em branco)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Free (ou Starter para produção)

### 3. Configurar Variáveis de Ambiente

Na seção **"Environment"** do Web Service, adicione:

#### Variáveis Obrigatórias:

```bash
NODE_ENV=production

# Cole o Internal Database URL do PostgreSQL que você criou
DATABASE_URL=postgresql://user:password@hostname/database

# Gere um secret forte (comando abaixo)
JWT_SECRET=seu_jwt_secret_aqui

# Seu domínio do Render (será algo como: https://conselhos-esotericos.onrender.com)
ALLOWED_ORIGINS=https://seu-app.onrender.com
```

#### Como gerar JWT_SECRET:
```bash
openssl rand -base64 32
```

### 4. Deploy

1. Clique em **"Create Web Service"**
2. O Render irá automaticamente:
   - Instalar dependências (`npm install`)
   - Build do projeto (`npm run build`)
   - Criar as tabelas no banco de dados
   - Iniciar o servidor
3. Aguarde o deploy finalizar (pode levar 3-5 minutos)

### 5. Verificar Deploy

Após o deploy:
1. Clique no link do seu app (https://seu-app.onrender.com)
2. Teste o cadastro e login
3. Verifique os logs em **"Logs"** no dashboard do Render

## 🔧 Comandos Importantes

### Build
```bash
npm run build
```

### Iniciar Produção
```bash
npm start
# ou
node dist/index.js
```

### Verificar Logs no Render
- Dashboard → Seu Web Service → **"Logs"**

## 📊 Estrutura de Build

O comando `npm run build` executa:
1. **Build Client**: `vite build` - compila React/TypeScript para `dist/public/`
2. **Build Server**: `tsc` - compila TypeScript do servidor para `dist/`

Arquivos gerados:
```
dist/
├── public/           # Frontend (servido estaticamente)
│   ├── index.html
│   └── assets/
├── index.js          # Servidor principal
├── database.js       # Configuração do banco
└── websocket.js      # WebSocket server
```

## 🗄️ Banco de Dados

O banco PostgreSQL é inicializado automaticamente na primeira execução.

Tabelas criadas:
- `users` - Usuários do sistema
- `consultants` - Consultores cadastrados
- `consultations` - Consultas realizadas
- `messages` - Mensagens das consultas
- `credits_transactions` - Histórico de créditos
- `testimonials` - Avaliações

## 🔒 Segurança

### Checklist:
- ✅ JWT_SECRET forte e único
- ✅ DATABASE_URL não exposto no código
- ✅ CORS configurado com domínios específicos
- ✅ Conexão PostgreSQL com SSL
- ✅ Senhas hashadas com bcrypt

## 🐛 Troubleshooting

### Problema: Deploy falha no build
**Solução**: Verifique os logs. Geralmente é falta de dependências.
```bash
npm install
```

### Problema: Erro de conexão com banco
**Solução**: Verifique se DATABASE_URL está correto (use Internal Database URL, não External).

### Problema: CORS error no frontend
**Solução**: Adicione seu domínio do Render em ALLOWED_ORIGINS:
```
ALLOWED_ORIGINS=https://seu-app.onrender.com
```

### Problema: App não inicia
**Solução**: Verifique se o Start Command está correto:
```
node dist/index.js
```

## 🔄 Atualizações

Para fazer deploy de novas versões:
1. Faça push para seu repositório Git
2. O Render detecta automaticamente e faz rebuild
3. Ou clique em **"Manual Deploy"** → **"Deploy latest commit"**

## 💰 Custos

### Plano Free:
- Web Service: 750 horas/mês grátis
- PostgreSQL: 1 GB grátis
- **Limitação**: App dorme após 15 min de inatividade

### Plano Starter ($7/mês):
- Web Service sempre ativo
- PostgreSQL 10 GB
- SSL automático
- Sem sleep

## 📞 Suporte

- Documentação Render: https://render.com/docs
- Status: https://status.render.com
- Community: https://community.render.com

---

✅ **Projeto preparado e pronto para deploy no Render!**

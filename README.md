# 🌙 Conselhos Esotéricos

Portal completo de consultas esotéricas online com sistema de créditos, chat em tempo real e integração com consultores especializados.

## 🚀 Deploy no Vercel

### Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Neon](https://neon.tech) para banco de dados PostgreSQL
3. Conta no [Stripe](https://stripe.com) para pagamentos
4. Conta no [Anthropic](https://anthropic.com) para IA

### 1. Configuração do Banco de Dados

1. Crie um projeto no Neon
2. Copie a string de conexão
3. Configure as variáveis de ambiente no Vercel

### 2. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Vercel:

```env
# Database
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
NEON_DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Anthropic AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Server Configuration
NODE_ENV=production
CORS_ORIGIN=https://your-domain.vercel.app
```

### 3. Deploy

1. **Conecte seu repositório GitHub ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório GitHub

2. **Configure o build:**
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o processo de build
   - Seu site estará disponível em `https://your-project.vercel.app`

## 🛠️ Desenvolvimento Local

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/conselhos-esotericos.git
cd conselhos-esotericos

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run check        # Verificação TypeScript
npm run vercel-build # Build específico para Vercel
npm run preview      # Preview da build
```

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Componentes reutilizáveis
│       ├── pages/         # Páginas da aplicação
│       ├── hooks/         # Custom hooks
│       └── utils/         # Utilitários
├── server/                # Backend Express
│   └── index.ts          # Servidor principal
├── shared/               # Código compartilhado
├── public/               # Arquivos estáticos
├── dist/                 # Build de produção
├── vercel.json          # Configuração Vercel
├── package.json         # Dependências e scripts
└── README.md           # Este arquivo
```

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **React Hook Form** - Formulários
- **Zustand** - Gerenciamento de estado

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **Neon** - Database as a Service
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **WebSocket** - Comunicação em tempo real

### Integrações
- **Stripe** - Pagamentos
- **Anthropic** - IA para consultas
- **Google OAuth** - Autenticação social

## 🎯 Funcionalidades

### Para Clientes
- ✅ Cadastro e login
- ✅ Consulta de CPF
- ✅ Sistema de créditos
- ✅ Chat em tempo real com consultores
- ✅ Avaliação de consultores
- ✅ Histórico de consultas
- ✅ Blog esotérico

### Para Consultores
- ✅ Perfil profissional
- ✅ Gerenciamento de consultas
- ✅ Chat em tempo real
- ✅ Relatórios de performance
- ✅ Sistema de avaliações

### Administrativo
- ✅ Dashboard de métricas
- ✅ Gerenciamento de usuários
- ✅ Controle de créditos
- ✅ Moderação de conteúdo

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de dados com Zod
- CORS configurado
- Rate limiting
- Sanitização de inputs

## 📊 Performance

- Build otimizado com Vite
- Code splitting automático
- Lazy loading de componentes
- Cache de assets
- Compressão gzip
- CDN global do Vercel

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de build no Vercel:**
   - Verifique se todas as variáveis de ambiente estão configuradas
   - Confirme se o banco de dados está acessível
   - Verifique os logs de build no painel do Vercel

2. **Erro de conexão com banco:**
   - Verifique a string de conexão
   - Confirme se o banco está ativo no Neon
   - Teste a conexão localmente

3. **Problemas de CORS:**
   - Configure corretamente a variável `CORS_ORIGIN`
   - Verifique se o domínio está na lista de origens permitidas

### Logs e Debug

```bash
# Logs do Vercel
vercel logs

# Logs locais
npm run dev
# Verifique o console para erros
```

## 📈 Monitoramento

- **Vercel Analytics** - Métricas de performance
- **Sentry** - Monitoramento de erros (opcional)
- **Logs do Neon** - Monitoramento do banco

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o deploy:

- 📧 Email: suporte@conselhosesotericos.com
- 💬 Discord: [Link do servidor]
- 📱 WhatsApp: [Número de contato]

---

**Desenvolvido com ❤️ para a comunidade esotérica brasileira**
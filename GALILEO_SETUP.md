# 🔭 Galileo Observability - Setup

## O Que É?

Galileo é uma plataforma de observabilidade para aplicações de IA que permite:
- 📊 Monitorar prompts e respostas de LLMs
- 💰 Rastrear custos de tokens
- 🐛 Detectar alucinações e erros
- 📈 Analisar performance
- 🧪 Testar variações de prompts

---

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install galileo
```

### 2. Configurar Variáveis de Ambiente

Adicione no Render (ou `.env.local` local):

```env
# Galileo Observability
GALILEO_API_KEY=sua_api_key_aqui
GALILEO_PROJECT=conselhos-esotericos
GALILEO_LOG_STREAM=production
```

**Obter API Key:**
1. Acesse: https://console.galileo.ai/
2. Crie conta gratuita
3. Settings → API Keys → Create Key
4. Copie a key

### 3. Inicializar no Server

No arquivo `server/index.ts`, adicione:

```typescript
import { initGalileo, flushGalileo } from './lib/galileo.js';

// Após inicializar o servidor
const startServer = async () => {
  await initDB();
  await initGalileo(); // ← Adicionar aqui
  
  // ... resto do código
};

// No shutdown
process.on('SIGTERM', async () => {
  await flushGalileo(); // ← Enviar logs antes de fechar
  process.exit(0);
});
```

---

## 📝 Como Usar

### Exemplo 1: Monitorar Workflow de Consulta

```typescript
import { logWorkflow } from './lib/galileo.js';

// Decorar função que orquestra consulta
const startConsultation = logWorkflow(
  'start-consultation',
  async (userId: string, consultantId: string) => {
    // Sua lógica de consulta
    const consultation = await db.query('INSERT INTO consultations...');
    return consultation;
  }
);
```

### Exemplo 2: Monitorar Chamadas de IA

```typescript
import { logTool } from './lib/galileo.js';

const generateConsultationSummary = logTool(
  'generate-summary',
  async (consultationText: string) => {
    // Chamada para OpenAI, Claude, etc
    const summary = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: consultationText }]
    });
    return summary;
  }
);
```

### Exemplo 3: Integração com OpenAI

```typescript
import OpenAI from 'openai';
import { wrapOpenAI } from 'galileo';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = wrapOpenAI(client);

// Agora todas as chamadas são automaticamente logadas
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## 📊 Dashboard Galileo

Após configurar, acesse:

**URL:** https://console.galileo.ai/

**O que você verá:**
- 📈 Gráficos de uso ao longo do tempo
- 💰 Custos por requisição
- ⏱️ Latência média
- 🎯 Taxa de sucesso/erro
- 📝 Logs de cada prompt/resposta
- 🔍 Busca por sessão/usuário

---

## 🎯 Casos de Uso no Projeto

### 1. Monitorar Consultas
- Rastrear duração das consultas
- Analisar padrões de uso
- Detectar consultas problemáticas

### 2. Qualidade das Respostas (se usar IA)
- Verificar coerência das respostas
- Detectar alucinações
- Melhorar prompts

### 3. Performance
- Identificar gargalos
- Otimizar tempo de resposta
- Reduzir custos

### 4. Experimentos A/B
- Testar variações de features
- Comparar abordagens
- Tomar decisões baseadas em dados

---

## 🔧 Configurar no Render

Via MCP (já configurado):

```bash
# Adicionar variável de ambiente
GALILEO_API_KEY=sua_chave_aqui
GALILEO_PROJECT=conselhos-esotericos
GALILEO_LOG_STREAM=production
```

---

## 💰 Planos

### Free Tier:
- ✅ 1.000 logs/mês grátis
- ✅ Retenção de 7 dias
- ✅ 1 projeto

### Pro:
- ✅ Logs ilimitados
- ✅ Retenção de 90 dias
- ✅ Projetos ilimitados
- ✅ Suporte prioritário
- 💵 $49/mês

---

## 📚 Recursos Adicionais

- 📖 Docs: https://docs.galileo.ai/
- 💬 Discord: https://discord.gg/galileo
- 🎥 Tutoriais: https://galileo.ai/tutorials

---

## ✅ Checklist de Implementação

- [ ] Criar conta no Galileo
- [ ] Obter API Key
- [ ] Instalar `npm install galileo`
- [ ] Criar arquivo `server/lib/galileo.ts`
- [ ] Adicionar env vars no Render
- [ ] Inicializar no `server/index.ts`
- [ ] Decorar funções importantes com `logWorkflow`/`logTool`
- [ ] Testar e ver logs no dashboard
- [ ] Configurar alertas (opcional)

---

**Pronto para começar? Quer que eu implemente a integração no código?** 🚀


## O Que É?

Galileo é uma plataforma de observabilidade para aplicações de IA que permite:
- 📊 Monitorar prompts e respostas de LLMs
- 💰 Rastrear custos de tokens
- 🐛 Detectar alucinações e erros
- 📈 Analisar performance
- 🧪 Testar variações de prompts

---

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install galileo
```

### 2. Configurar Variáveis de Ambiente

Adicione no Render (ou `.env.local` local):

```env
# Galileo Observability
GALILEO_API_KEY=sua_api_key_aqui
GALILEO_PROJECT=conselhos-esotericos
GALILEO_LOG_STREAM=production
```

**Obter API Key:**
1. Acesse: https://console.galileo.ai/
2. Crie conta gratuita
3. Settings → API Keys → Create Key
4. Copie a key

### 3. Inicializar no Server

No arquivo `server/index.ts`, adicione:

```typescript
import { initGalileo, flushGalileo } from './lib/galileo.js';

// Após inicializar o servidor
const startServer = async () => {
  await initDB();
  await initGalileo(); // ← Adicionar aqui
  
  // ... resto do código
};

// No shutdown
process.on('SIGTERM', async () => {
  await flushGalileo(); // ← Enviar logs antes de fechar
  process.exit(0);
});
```

---

## 📝 Como Usar

### Exemplo 1: Monitorar Workflow de Consulta

```typescript
import { logWorkflow } from './lib/galileo.js';

// Decorar função que orquestra consulta
const startConsultation = logWorkflow(
  'start-consultation',
  async (userId: string, consultantId: string) => {
    // Sua lógica de consulta
    const consultation = await db.query('INSERT INTO consultations...');
    return consultation;
  }
);
```

### Exemplo 2: Monitorar Chamadas de IA

```typescript
import { logTool } from './lib/galileo.js';

const generateConsultationSummary = logTool(
  'generate-summary',
  async (consultationText: string) => {
    // Chamada para OpenAI, Claude, etc
    const summary = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: consultationText }]
    });
    return summary;
  }
);
```

### Exemplo 3: Integração com OpenAI

```typescript
import OpenAI from 'openai';
import { wrapOpenAI } from 'galileo';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = wrapOpenAI(client);

// Agora todas as chamadas são automaticamente logadas
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## 📊 Dashboard Galileo

Após configurar, acesse:

**URL:** https://console.galileo.ai/

**O que você verá:**
- 📈 Gráficos de uso ao longo do tempo
- 💰 Custos por requisição
- ⏱️ Latência média
- 🎯 Taxa de sucesso/erro
- 📝 Logs de cada prompt/resposta
- 🔍 Busca por sessão/usuário

---

## 🎯 Casos de Uso no Projeto

### 1. Monitorar Consultas
- Rastrear duração das consultas
- Analisar padrões de uso
- Detectar consultas problemáticas

### 2. Qualidade das Respostas (se usar IA)
- Verificar coerência das respostas
- Detectar alucinações
- Melhorar prompts

### 3. Performance
- Identificar gargalos
- Otimizar tempo de resposta
- Reduzir custos

### 4. Experimentos A/B
- Testar variações de features
- Comparar abordagens
- Tomar decisões baseadas em dados

---

## 🔧 Configurar no Render

Via MCP (já configurado):

```bash
# Adicionar variável de ambiente
GALILEO_API_KEY=sua_chave_aqui
GALILEO_PROJECT=conselhos-esotericos
GALILEO_LOG_STREAM=production
```

---

## 💰 Planos

### Free Tier:
- ✅ 1.000 logs/mês grátis
- ✅ Retenção de 7 dias
- ✅ 1 projeto

### Pro:
- ✅ Logs ilimitados
- ✅ Retenção de 90 dias
- ✅ Projetos ilimitados
- ✅ Suporte prioritário
- 💵 $49/mês

---

## 📚 Recursos Adicionais

- 📖 Docs: https://docs.galileo.ai/
- 💬 Discord: https://discord.gg/galileo
- 🎥 Tutoriais: https://galileo.ai/tutorials

---

## ✅ Checklist de Implementação

- [ ] Criar conta no Galileo
- [ ] Obter API Key
- [ ] Instalar `npm install galileo`
- [ ] Criar arquivo `server/lib/galileo.ts`
- [ ] Adicionar env vars no Render
- [ ] Inicializar no `server/index.ts`
- [ ] Decorar funções importantes com `logWorkflow`/`logTool`
- [ ] Testar e ver logs no dashboard
- [ ] Configurar alertas (opcional)

---

**Pronto para começar? Quer que eu implemente a integração no código?** 🚀


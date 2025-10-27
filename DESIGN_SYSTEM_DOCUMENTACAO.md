# 🎨 Design System - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Cores](#cores)
3. [Tipografia](#tipografia)
4. [Componentes](#componentes)
5. [Animações](#animações)
6. [Dark Mode](#dark-mode)
7. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

Design System completo desenvolvido via **MCP Galileo** para o projeto Conselhos Esotéricos. Sistema moderno, responsivo e acessível com suporte a Dark Mode.

### Características:
- ✅ Sistema de cores completo (50-950)
- ✅ Gradientes místicos e cósmicos
- ✅ Tipografia escalável
- ✅ Componentes reutilizáveis
- ✅ Animações fluidas
- ✅ Dark Mode nativo
- ✅ Totalmente responsivo

---

## 🎨 Cores

### Primárias (Roxo Místico)
```css
--primary-600: #9333ea  /* Principal */
--primary-700: #7e22ce  /* Hover */
--primary-500: #a855f7  /* Variante clara */
```

### Secundárias (Azul Místico)
```css
--secondary-600: #2563eb
--secondary-500: #3b82f6
```

### Acentuadas (Dourado)
```css
--accent-500: #f59e0b
--accent-600: #d97706
```

### Funcionais
```css
--success: #10b981
--error: #ef4444
--warning: #f59e0b
--info: #3b82f6
```

### Gradientes
```css
--gradient-primary: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-400) 100%);
--gradient-mystic: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
--gradient-cosmic: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
```

---

## ✍️ Tipografia

### Fontes
- **Sans-Serif:** Inter (padrão)
- **Display:** Playfair Display (títulos)
- **Monospace:** Fira Code (código)

### Tamanhos
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
--text-5xl: 3rem      /* 48px */
--text-6xl: 3.75rem   /* 60px */
```

### Pesos
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

---

## 🧩 Componentes

### 1. GradientCard
Card com gradiente e efeitos hover.

```tsx
import GradientCard from '@/components/ui/GradientCard';

<GradientCard 
  variant="primary" // primary | secondary | mystic | cosmic | glass
  hover={true}
  glow={true}
>
  <h3>Título</h3>
  <p>Conteúdo</p>
</GradientCard>
```

**Variantes:**
- `primary`: Roxo gradiente
- `secondary`: Azul/Roxo
- `mystic`: Índigo/Roxo/Rosa
- `cosmic`: Índigo/Azul
- `glass`: Glass morphism

---

### 2. AnimatedSection
Seção com animação de entrada (Intersection Observer).

```tsx
import AnimatedSection from '@/components/ui/AnimatedSection';

<AnimatedSection
  animation="fade-up" // fade-up | fade-down | fade-left | fade-right | scale
  delay={200}
  threshold={0.1}
>
  <div>Conteúdo que anima na viewport</div>
</AnimatedSection>
```

**Animações disponíveis:**
- `fade-up`: Surge de baixo
- `fade-down`: Surge de cima
- `fade-left`: Surge da esquerda
- `fade-right`: Surge da direita
- `scale`: Aumenta de tamanho

---

### 3. FloatingCard
Card flutuante com efeito 3D no hover.

```tsx
import FloatingCard from '@/components/ui/FloatingCard';

<FloatingCard tiltEffect={true}>
  <div className="p-6">
    <h3>Card Flutuante</h3>
    <p>Mova o mouse sobre o card</p>
  </div>
</FloatingCard>
```

**Efeitos:**
- Levitação no hover
- Rotação 3D interativa
- Borda gradiente animada
- Sombra dinâmica

---

### 4. StatCard
Card de estatísticas com ícone.

```tsx
import StatCard from '@/components/ui/StatCard';
import { Users } from 'lucide-react';

<StatCard
  label="Total de Usuários"
  value="1,234"
  icon={Users}
  trend="up"           // up | down | neutral
  trendValue="+12%"
  variant="primary"    // primary | success | warning | error
/>
```

**Recursos:**
- Ícone opcional
- Trend indicator
- 4 variantes de cor
- Background pattern sutil

---

### 5. HeroSection
Hero section completo com animações.

```tsx
import HeroSection from '@/components/ui/HeroSection';

<HeroSection
  title="Título Principal"
  subtitle="✨ Subtítulo opcional"
  description="Descrição detalhada do serviço"
  background="mystic" // gradient | mystic | cosmic | dark
  actions={
    <>
      <button>CTA Principal</button>
      <button>CTA Secundário</button>
    </>
  }
/>
```

**Recursos:**
- Partículas flutuantes de fundo
- Wave decoration no final
- Gradientes personalizáveis
- Totalmente responsivo

---

### 6. OptimizedImage
Imagem otimizada com lazy loading.

```tsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/path/to/image.jpg"
  alt="Descrição"
  className="rounded-lg"
  fallback="/placeholder.jpg"
  placeholder="data:image/svg+xml..." // SVG placeholder
  width={400}
  height={400}
/>
```

**Recursos:**
- Lazy loading (Intersection Observer)
- Placeholder blur effect
- Fallback automático em erro
- Loading state animado
- Transições suaves

---

### 7. DarkModeToggle
Toggle de Dark Mode animado.

```tsx
import DarkModeToggle from '@/components/DarkModeToggle';

<DarkModeToggle />
```

**Recursos:**
- Transição suave Sol/Lua
- Salva preferência no localStorage
- Respeita preferência do sistema
- Animação de rotação

---

## 🎬 Animações

### Animações CSS

#### Float
```css
.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

#### Pulse Glow
```css
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

#### Shimmer (Skeleton)
```css
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}
```

#### Fade In Up
```css
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}
```

#### Scale In
```css
.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
```

---

## 🌙 Dark Mode

### Ativação
O Dark Mode é ativado automaticamente baseado em:
1. Preferência salva no localStorage
2. Preferência do sistema (se não houver salva)

### Variáveis Dark Mode
```css
[data-theme="dark"] {
  --bg-primary: var(--gray-950);
  --bg-secondary: var(--gray-900);
  --text-primary: var(--gray-50);
  --text-secondary: var(--gray-300);
}
```

### Classes Utilitárias
```tsx
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">
    Título
  </h1>
</div>
```

---

## 💡 Exemplos de Uso

### Card com Gradiente e Animação
```tsx
<AnimatedSection animation="fade-up" delay={100}>
  <GradientCard variant="mystic" hover glow>
    <div className="p-6 text-white">
      <h3 className="text-2xl font-bold mb-2">
        Tarot Online
      </h3>
      <p>
        Consultas 24/7
      </p>
    </div>
  </GradientCard>
</AnimatedSection>
```

### Grid de Estatísticas
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard
    label="Usuários Ativos"
    value="1,234"
    icon={Users}
    trend="up"
    trendValue="+12%"
    variant="primary"
  />
  <StatCard
    label="Consultas"
    value="5,678"
    icon={MessageCircle}
    trend="up"
    trendValue="+8%"
    variant="success"
  />
</div>
```

### Hero Section Completo
```tsx
<HeroSection
  subtitle="✨ Novo Serviço"
  title={
    <span>
      Transforme Sua Vida com{" "}
      <span className="text-gradient">Sabedoria</span>
    </span>
  }
  description="Conecte-se com especialistas certificados"
  background="cosmic"
  actions={
    <>
      <Link href="/consultores">
        <button className="px-8 py-4 bg-white text-purple-600 rounded-full">
          Começar Agora
        </button>
      </Link>
      <Link href="/sobre">
        <button className="px-8 py-4 bg-white/10 border-2 border-white text-white rounded-full">
          Saiba Mais
        </button>
      </Link>
    </>
  }
/>
```

---

## 🎯 Classes Utilitárias

### Gradientes
```html
<div class="gradient-primary">Gradiente Primário</div>
<div class="gradient-mystic">Gradiente Místico</div>
<div class="gradient-cosmic">Gradiente Cósmico</div>
```

### Texto Gradiente
```html
<h1 class="text-gradient">Texto com Gradiente</h1>
```

### Glow Effect
```html
<div class="glow">Elemento com brilho</div>
<div class="glow-lg">Brilho intenso</div>
```

### Glass Morphism
```html
<div class="glass">Glass effect claro</div>
<div class="glass-dark">Glass effect escuro</div>
```

---

## 📱 Responsive

### Breakpoints
```css
/* Mobile: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */
```

### Ajustes Automáticos
- Tamanhos de fonte reduzidos em mobile
- Grid adapta de 1 → 2 → 3 colunas
- Espaçamentos proporcionais
- Hero section otimizado para mobile

---

## ✅ Checklist de Implementação

- [x] Design System CSS criado
- [x] Componentes visuais implementados
- [x] Dark Mode funcional
- [x] Animações configuradas
- [x] HomePage redesenhada
- [x] Responsive testado
- [x] Documentação completa

---

## 🚀 Deploy

```bash
# Build
npm run build

# Test local
npm run dev

# Deploy
git add -A
git commit -m "feat: Design System completo"
git push origin main
```

---

## 📞 Suporte

Para dúvidas sobre o Design System:
- Consulte esta documentação
- Veja exemplos em `/client/src/pages/HomeModern.tsx`
- Teste componentes isoladamente

---

**✨ Design System desenvolvido via MCP Galileo**
**🎨 Pronto para produção**
**🚀 Otimizado para performance**


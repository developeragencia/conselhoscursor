import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/design-system.css";
import "./styles/mobile.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="sensitivos-theme">
    <App />
  </ThemeProvider>
);

// ===== PWA Service Worker Registration =====
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ PWA: Service Worker registrado', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 PWA: Nova versão disponível');
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão instalada, notificar usuário
              if (confirm('Nova versão disponível! Recarregar página?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ PWA: Erro ao registrar Service Worker', error);
      });
  });
}

// ===== PWA Install Prompt =====
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📱 PWA: Instalação disponível');
  
  // Mostrar botão de instalação customizado (opcional)
  showInstallPromotion();
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA: App instalado');
  deferredPrompt = null;
});

function showInstallPromotion() {
  // Criar banner de instalação
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: linear-gradient(135deg, #9333ea, #c084fc);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.4);
    z-index: 10000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideUp 0.3s ease-out;
  `;
  
  banner.innerHTML = `
    <div>
      <strong style="display: block; margin-bottom: 4px;">Instalar App</strong>
      <span style="font-size: 14px; opacity: 0.9;">Acesso rápido na tela inicial</span>
    </div>
    <div style="display: flex; gap: 12px;">
      <button id="pwa-install-btn" style="
        background: white;
        color: #9333ea;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
      ">Instalar</button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
      ">Agora não</button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Botão instalar
  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalação`);
      deferredPrompt = null;
      banner.remove();
    }
  });
  
  // Botão dismiss
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    banner.remove();
  });
}

// ===== Mobile Optimizations =====
// Prevenir zoom duplo-toque em iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Detectar instalação PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ PWA: App rodando em modo standalone');
  document.body.classList.add('pwa-installed');
}

console.log('🚀 App inicializado:', new Date().toISOString());

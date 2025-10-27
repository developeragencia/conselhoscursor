import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/responsive.css";
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
        console.log('✅ PWA: Service Worker registrado');
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nova versão disponível');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker', error);
      });
  });
}

console.log('🚀 App inicializado:', new Date().toISOString());

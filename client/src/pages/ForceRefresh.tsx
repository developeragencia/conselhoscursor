import { useEffect } from "react";

export default function ForceRefresh() {
  useEffect(() => {
    // Limpar todo o cache
    localStorage.clear();
    sessionStorage.clear();
    
    // Recarregar com cache bypass
    window.location.href = window.location.href + '?t=' + Date.now();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Carregando nova versão...</h1>
        <p className="mt-2">Limpando cache e atualizando sistema</p>
      </div>
    </div>
  );
}
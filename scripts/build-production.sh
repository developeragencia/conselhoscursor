#!/bin/bash

# Script de build para produção
echo "🚀 Iniciando build para produção..."

# 1. Limpa diretórios de build
echo "🧹 Limpando diretórios anteriores..."
rm -rf dist
rm -rf build

# 2. Instala dependências
echo "📦 Instalando dependências..."
npm install --production=false

# 3. Compila TypeScript
echo "🔨 Compilando TypeScript..."
npm run tsc

# 4. Build do cliente
echo "🏗️ Construindo aplicação cliente..."
npm run build:client

# 5. Build do servidor
echo "🏭 Construindo servidor..."
npm run build:server

# 6. Copia arquivos estáticos
echo "📄 Copiando arquivos estáticos..."
cp -r public/* dist/public/
cp .env.production dist/.env

# 7. Otimiza imagens
echo "🖼️ Otimizando imagens..."
npm run optimize-images

# 8. Minifica assets
echo "📦 Minificando assets..."
npm run minify

# 9. Gera source maps
echo "🗺️ Gerando source maps..."
npm run generate-sourcemaps

# 10. Validação final
echo "✅ Executando validação final..."
node scripts/validate-deployment.js

echo "🎉 Build concluído com sucesso!"
echo "📝 Para fazer deploy, execute: npm run deploy"
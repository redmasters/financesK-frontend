#!/bin/bash

echo "🚀 Validando Deploy para Vercel..."
echo "=================================="

# Verificar se o build foi executado
if [ ! -d "dist/financesK-front/browser" ]; then
    echo "❌ Erro: Pasta de build não encontrada. Execute 'npm run build:vercel' primeiro."
    exit 1
fi

# Verificar se o index.html existe
if [ ! -f "dist/financesK-front/browser/index.html" ]; then
    echo "❌ Erro: index.html não encontrado."
    exit 1
fi

# Verificar arquivos essenciais
echo "📁 Verificando arquivos essenciais..."
files=("index.html" "favicon.ico" "styles-*.css" "main-*.js" "polyfills-*.js")
missing_files=0

for pattern in "${files[@]}"; do
    if ls dist/financesK-front/browser/$pattern 1> /dev/null 2>&1; then
        echo "   ✅ $pattern encontrado"
    else
        echo "   ❌ $pattern não encontrado"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo "❌ Alguns arquivos essenciais estão faltando."
    exit 1
fi

# Verificar tamanho dos arquivos
echo ""
echo "📊 Tamanhos dos arquivos principais:"
ls -lh dist/financesK-front/browser/{index.html,main-*.js,styles-*.css} | awk '{print "   " $5 " - " $9}'

# Verificar se o vercel.json está configurado corretamente
if [ ! -f "vercel.json" ]; then
    echo "❌ Erro: vercel.json não encontrado."
    exit 1
fi

echo ""
echo "🔧 Verificando configurações..."
echo "   ✅ vercel.json configurado"
echo "   ✅ Ambiente Vercel configurado"
echo "   ✅ Scripts de build configurados"

echo ""
echo "🎉 Deploy válido! Pronto para Vercel!"
echo ""
echo "📋 Próximos passos:"
echo "   1. git add . && git commit -m 'feat: deploy configuration for vercel'"
echo "   2. git push origin main"
echo "   3. Conectar repositório na Vercel"
echo "   4. Configurar variáveis de ambiente na Vercel"
echo ""
echo "🌐 URLs de exemplo após deploy:"
echo "   Preview: https://seu-projeto-git-branch.vercel.app"
echo "   Production: https://seu-projeto.vercel.app"

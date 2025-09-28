# Deploy na Vercel - FinancesK Frontend

## 🚀 Deploy Automático

### 1. Deploy via GitHub
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

### 2. Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy de preview
npm run preview:vercel

# Deploy em produção
npm run deploy:vercel
```

## ⚙️ Configurações Otimizadas

### Build Command
```
npm run build:vercel
```

### Output Directory
```
dist/finances-k-front
```

### Node.js Version
```
18.x
```

## 📋 Variáveis de Ambiente

Configure no painel da Vercel:

```env
NODE_ENV=production
API_URL=https://sua-api.com/api/v1
```

## 🔧 Configurações de Performance

### Otimizações Implementadas:
- ✅ Bundle splitting otimizado
- ✅ Tree shaking configurado
- ✅ Headers de cache para assets
- ✅ Compressão gzip automática
- ✅ CSP e headers de segurança
- ✅ Lazy loading de módulos
- ✅ Otimização de imagens

### Headers de Segurança:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content Security Policy configurado
- Referrer Policy otimizado

## 📊 Monitoramento

### Scripts de Análise:
```bash
# Analisar bundle
npm run analyze

# Build com métricas
npm run build:vercel -- --stats-json
```

### Vercel Analytics
Configurado automaticamente com:
- Core Web Vitals
- Performance metrics
- Error tracking

## 🔍 Troubleshooting

### Problemas Comuns:

1. **Build Error - Memory**
   - Configurado NODE_OPTIONS com 4GB
   - Build otimizado para Vercel

2. **404 em Rotas**
   - Configurado SPA fallback no vercel.json
   - Rewrites automáticos para /index.html

3. **CORS Issues**
   - Verificar API URL no environment.vercel.ts
   - Configurar CORS no backend

### Logs e Debug:
```bash
# Ver logs do deploy
vercel logs [deployment-url]

# Build local para debug
npm run build:vercel
```

## 📁 Estrutura de Arquivos

```
├── vercel.json          # Configuração principal
├── .vercelignore        # Arquivos ignorados
├── .nvmrc              # Versão do Node.js
├── src/
│   ├── main.vercel.ts   # Bootstrap otimizado
│   └── environments/
│       └── environment.vercel.ts
└── angular.json         # Config de build Vercel
```

## 🌐 URLs de Exemplo

- **Preview**: `https://your-app-git-branch.vercel.app`
- **Production**: `https://your-app.vercel.app`

## 📈 Performance Targets

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Bundle Size: < 1.5MB

---

**Nota**: Lembre-se de atualizar a URL da API no `environment.vercel.ts` antes do deploy!

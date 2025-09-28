# Deploy Guide - FinancesK Frontend

Este guia explica como fazer deploy da aplicação FinancesK Frontend em diferentes ambientes.

## Ambientes Configurados

### 1. Desenvolvimento (Local)
- **Arquivo**: `src/environments/environment.ts`
- **API URL**: `http://localhost:8080/api/v1`
- **Características**: Debug habilitado, source maps, sem otimizações

### 2. Staging
- **Arquivo**: `src/environments/environment.staging.ts`
- **API URL**: `https://staging-api.yourdomain.com/api/v1`
- **Características**: HTTPS habilitado, logs informativos, source maps habilitados

### 3. Produção
- **Arquivo**: `src/environments/environment.prod.ts`
- **API URL**: `https://api.yourdomain.com/api/v1`
- **Características**: HTTPS obrigatório, logs apenas de erro, otimizações máximas

## Scripts Disponíveis

### Desenvolvimento
```bash
npm start                # Inicia servidor de desenvolvimento
npm run start:staging    # Inicia com configuração de staging
npm run build:dev        # Build para desenvolvimento
```

### Build para Deploy
```bash
npm run build:staging    # Build otimizado para staging
npm run build:prod       # Build otimizado para produção
```

### Deploy com Docker
```bash
# Build da imagem de desenvolvimento
npm run docker:build

# Build da imagem de produção
npm run docker:build:prod

# Executar container
npm run docker:run
```

## Configuração para Produção

### 1. Atualizar URLs das APIs
Antes do deploy, atualize as URLs nos arquivos de ambiente:

**environment.prod.ts:**
```typescript
apiUrl: 'https://sua-api-de-producao.com/api/v1'
```

**environment.staging.ts:**
```typescript
apiUrl: 'https://sua-api-de-staging.com/api/v1'
```

### 2. Deploy com Docker Compose

Para produção:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Para desenvolvimento:
```bash
docker-compose up -d
```

### 3. Deploy Manual

1. **Build da aplicação:**
   ```bash
   npm run build:prod
   ```

2. **Os arquivos estarão em:** `dist/finances-k-front/`

3. **Copiar para servidor web** (Nginx, Apache, etc.)

## Configurações de Segurança

### Nginx (Produção)
- Arquivo de configuração: `nginx-prod.conf`
- Headers de segurança configurados
- Compressão gzip habilitada
- Cache otimizado para assets estáticos

### Recursos de Segurança Implementados
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy

## Verificações Pré-Deploy

1. **Teste local:**
   ```bash
   npm run build:prod
   # Verificar se não há erros de build
   ```

2. **Teste com staging:**
   ```bash
   npm run build:staging
   # Testar em ambiente de staging
   ```

3. **Verificar variáveis de ambiente:**
   - URLs das APIs estão corretas
   - Certificados SSL configurados
   - Headers de segurança implementados

## Troubleshooting

### Problemas Comuns

1. **Erro 404 em rotas SPA:**
   - Verificar configuração do servidor web para fallback para index.html

2. **Problemas de CORS:**
   - Verificar configuração da API backend
   - Confirmar URLs nos arquivos de ambiente

3. **Assets não carregam:**
   - Verificar base href no index.html
   - Confirmar configuração de cache do servidor

### Logs e Monitoramento

- **Desenvolvimento**: Logs no console do navegador
- **Staging**: Logs de info e erro enviados para servidor
- **Produção**: Apenas logs críticos enviados para servidor

## Comandos Úteis

```bash
# Verificar versão do Angular
ng version

# Análise do bundle
npm run build:prod -- --stats-json
npx webpack-bundle-analyzer dist/finances-k-front/stats.json

# Testar build local
npm run build:prod && npx http-server dist/finances-k-front
```

## Variáveis de Ambiente Disponíveis

| Variável | Desenvolvimento | Staging | Produção |
|----------|----------------|---------|----------|
| production | false | false | true |
| enableDevTools | true | false | false |
| enableMocking | false | false | false |
| logging.level | debug | info | error |
| enableAnalytics | false | false | true |
| security.enableHttps | false | true | true |

---

**Nota:** Lembre-se de atualizar as URLs das APIs nos arquivos de ambiente antes de fazer deploy para staging ou produção!

# =============================================================================
# Multi-stage Docker build for FinancesK Frontend
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build stage (para compilar a aplicação)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Metadados
LABEL maintainer="FinancesK Team"
LABEL description="FinancesK Frontend Application"

# Instala dependências do sistema necessárias
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências primeiro (para melhor cache)
COPY package*.json ./

# Instala dependências com cache otimizado
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copia código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build --prod

# -----------------------------------------------------------------------------
# Stage 2: Development stage (para ambiente de desenvolvimento)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS development

# Instala dependências do sistema
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Define diretório de trabalho
WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala todas as dependências (incluindo dev)
RUN npm ci --silent

# Copia código fonte
COPY . .

# Expõe porta do servidor de desenvolvimento
EXPOSE 4200

# Comando para desenvolvimento (com hot reload)
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

# -----------------------------------------------------------------------------
# Stage 3: Production stage (para ambiente de produção)
# -----------------------------------------------------------------------------
FROM nginx:1.25-alpine AS production

# Metadados
LABEL stage="production"

# Instala curl para health check
RUN apk add --no-cache curl

# Remove configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia arquivos buildados do stage builder
COPY --from=builder /app/dist/finances-k-front /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Define permissões corretas
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando para produção
CMD ["nginx", "-g", "daemon off;"]

# -----------------------------------------------------------------------------
# Stage 4: Testing stage (para testes automatizados)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS testing

WORKDIR /app

# Instala dependências para testes
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurações para Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Copia dependências
COPY package*.json ./
RUN npm ci --silent

# Copia código fonte
COPY . .

# Comando para testes
CMD ["npm", "run", "test", "--", "--watch=false", "--browsers=ChromiumHeadless"]

# Multi-stage Dockerfile para FinancesK Frontend

# Estágio base com Node.js
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Estágio de desenvolvimento
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

# Estágio de build para produção
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio de produção com backend real
FROM nginx:alpine AS production
COPY --from=build /app/dist/finances-k-front /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Estágio de produção com backend mock
FROM nginx:alpine AS production-mock
COPY --from=build /app/dist/finances-k-front /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY mock-backend.conf /etc/nginx/conf.d/api.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

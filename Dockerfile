# syntax=docker/dockerfile:1.7

# ---------- Dev ----------
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---------- Production (nginx + backend real) ----------
FROM nginx:1.27-alpine AS production
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/finances-k-front /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ---------- Production mock ----------
FROM nginx:1.27-alpine AS production-mock
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY mock-backend.conf /etc/nginx/conf.d/api.conf
COPY --from=build /app/dist/finances-k-front /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

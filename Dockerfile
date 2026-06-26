# --- Etapa 1: build con Node ---
FROM node:20-alpine AS build
WORKDIR /app

# Instalamos dependencias primero (mejor cache de capas)
COPY package*.json ./
RUN npm ci

# Y compilamos la app (tsc + vite build -> /app/dist)
COPY . .
RUN npm run build

# --- Etapa 2: servir los estáticos con nginx ---
FROM nginx:alpine
# Config propia: SPA + proxy /api al contenedor de la API
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

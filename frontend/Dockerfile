# Estágio 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Serve
FROM nginx:stable-alpine
# Copia o build do Vite para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copia uma config básica para suportar rotas de SPA (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
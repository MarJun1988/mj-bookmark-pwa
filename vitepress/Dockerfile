# ---------- Build Stage ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache git


WORKDIR /app

# Nur package Dateien zuerst (Cache!)
COPY package*.json ./
RUN npm install

# Projektdateien kopieren
COPY . .

# VitePress build
RUN npm run docs:build


# ---------- Runtime Stage ----------
FROM nginx:alpine

# VitePress Output kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: eigene nginx config
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:20-slim AS base
WORKDIR /app

# Tools für Prisma + Healthchecks
RUN apt-get update -y && \
    apt-get install -y openssl curl netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# ---- Install dependencies ----
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY prisma.config.js ./

RUN npm install

# ---- Build TS ----
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Copy start script ----
COPY start.sh .
# 👉 Shared again (falls benötigt)
#COPY shared ./shared

EXPOSE 4000

CMD ["./start.sh"]
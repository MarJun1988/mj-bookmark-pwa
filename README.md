# 🔖 Lesezeichen Verwaltung (Bookmark PWA)

**Lesezeichen Verwaltung** ist eine moderne, selbst‑gehostete **Bookmark‑ & Startseiten‑Web‑App**.
Sie dient als persönliche oder teaminterne Startseite mit Tabs, Gruppen, Lesezeichen, Tags und Widgets – optimiert für
Desktop, Tablet und mobile Geräte.

Das Projekt ist **Docker‑first**, API‑getrieben (GraphQL) und vollständig **Self‑Hosted‑ready**.

---

## ✨ Features

* 📑 **Tabs & Gruppen** zur strukturierten Organisation
* 🔖 **Lesezeichen (Bookmarks)** mit automatischem Favicon‑Fetch
* 🏷️ **Tags** inkl. Mehrfachzuweisung & Filter
* 🔍 **Globale Suche / Command Palette**
* 🔄 **Drag & Drop** (Tabs, Gruppen, Einträge)
* ⚡ **Live‑Updates** via GraphQL Subscriptions
* 🧠 **Offline‑fähig (PWA‑ready)**
* 🐳 **Docker‑first Architektur**
* 🤖 **CI/CD‑fähig (GitLab)**
* 🔐 **JWT + Refresh‑Token Authentifizierung**

---

## 🏗️ Architektur

| Ebene          | Technologie                                 |
|----------------|---------------------------------------------|
| Frontend       | Vue 3, TypeScript, Tailwind CSS, PrimeVue 4 |
| Backend        | Node.js, Apollo Server v4, Prisma           |
| Datenbank      | PostgreSQL                                  |
| Cache / PubSub | Redis                                       |
| Kommunikation  | GraphQL (HTTP + WebSocket)                  |
| Auth           | JWT + Refresh Token (Cookie)                |

---

## 🚀 Erste Schritte

```bash
git clone https://gitlab.com/MarJun1988/lesezeichen-verwaltung.git
cd lesezeichen-verwaltung
```

Anwendung im Browser öffnen:

👉 **[http://127.0.0.1](http://127.0.0.1)**

---

## ⚙️ Services im System

* **PostgreSQL** – Persistente Datenbank
* **Redis** – Cache & Pub/Sub (Subscriptions)
* **Backend** – Apollo GraphQL Server + Prisma
* **Frontend** – Vue 3 SPA über Nginx inkl. Reverse Proxy

---

## 🔌 API Endpunkte

| Typ          | Beispiel                        |
|--------------|---------------------------------|
| GraphQL HTTP | `http://IP-ADRESSE/api/graphql` |
| GraphQL WS   | `ws://IP-ADRESSE/api/graphql`   |

---

## 🧩 Docker Setup Überblick

| Datei                     | Zweck            |
|---------------------------|------------------|
| `docker-compose.yml`      | Standard / lokal |
| `docker-compose.dev.yml`  | Entwicklung      |
| `docker-compose.prod.yml` | Produktion       |

---

## 📁 Projektstruktur

```text
.
├─ backend/              # GraphQL Backend
│  ├─ prisma/            # Prisma Schema & Migrations
│  └─ src/
├─ frontend/             # Vue 3 + PrimeVue Frontend
├─ nginx/                # Reverse Proxy & SPA Config
├─ backup/               # PostgreSQL Backup Container
├─ docker-compose.yml
├─ docker-compose.dev.yml
├─ docker-compose.prod.yml
└─ .env
```

---

## 🔐 Umgebungsvariablen (`.env`)

```env
POSTGRES_USER=bookmark
POSTGRES_PASSWORD=secret
POSTGRES_DB=bookmark

DATABASE_URL=postgres://bookmark:secret@db:5432/bookmark

NODE_ENV=production
BACKEND_PORT=4000
REDIS_HOST=redis

JWT_SECRET=super-secret-key
JWT_REFRESH_SECRET=super-refresh-secret

FRONTEND_HTTP_PORT=80
FRONTEND_HTTPS_PORT=443
```

⚠️ **Wichtig:** `.env` niemals ins Git einchecken.

---

## 🟦 Standard Start

```bash
docker compose up --build
docker compose down
```

---

## 🟩 Entwicklungsmodus

### Lokal (Frontend & Backend)

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Docker (nur DB + Redis)

```bash
docker compose -f docker-compose.dev.yml up
docker compose -f docker-compose.dev.yml down
```

---

## 🟥 Produktion

```bash
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml down
```

Optional mit SSL:

```text
nginx/ssl/
├─ fullchain.pem
├─ privkey.pem
```

---

## 🛠 Prisma Befehle

```bash
docker exec backend npx prisma migrate dev --name init
docker exec backend npx prisma migrate deploy
docker exec backend npx prisma db seed
```

---

## 🔄 Favicons & Metadaten

* Favicons werden **automatisch** beim Anlegen von Links geladen
* Optionaler Batch‑Refresh per GraphQL Mutation
* Bereits vorhandene Favicons werden standardmäßig **nicht** überschrieben

---

## 🧪 CI/CD (optional)

* Build von Backend & Frontend Images
* Push in Container Registry
* Images‑only Deployment (kein Git auf Prod)
* Optionale DB‑Backups

---

## 🗄 PostgreSQL Backups

Eigener Docker‑Container:

✔ Automatische Backups
✔ Speicherung im Volume `pg_backups`
✔ Automatisches Cleanup
✔ Kein Host‑Cron notwendig

---

## 🔄 Restore

```bash
docker exec -i db psql -U bookmark bookmark < backup.sql
```

---

## 📜 Lizenz

MIT License

---

🚀 **Viel Spaß beim Organisieren deiner Lesezeichen!**

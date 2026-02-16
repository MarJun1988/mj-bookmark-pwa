# 🔖 MJ-Bookmark-PWA

**MJ-Bookmark-PWA** ist eine moderne, selbst-gehostete **Bookmark- & Startseiten-Web-App**.  
Sie dient als persönliche oder teaminterne Startseite mit Tabs, Gruppen, Lesezeichen, Tags und Widgets – optimiert für
Desktop, Tablet und mobile Geräte.

Das Projekt ist **Docker-first**, API-getrieben (GraphQL) und vollständig **Self-Hosted-ready**.

---

## ✨ Features

* 📑 **Tabs & Gruppen** zur strukturierten Organisation
* 🔖 **Lesezeichen (Bookmarks)** mit automatischem Favicon-Fetch
* 🏷️ **Tags** inkl. Mehrfachzuweisung & Filter
* 🔍 **Globale Suche / Command Palette**
* 🔄 **Drag & Drop** (Tabs, Gruppen, Einträge)
* ⚡ **Live-Updates** via GraphQL Subscriptions
* 🧠 **Offline-fähig (PWA-ready)**
* 🐳 **Docker-first Architektur**
* 🤖 **CI/CD-fähig (GitLab)**
* 🔐 **JWT + Refresh-Token Authentifizierung**

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
git clone https://github.com/MarJun1988/mj-bookmark-pwa.git
cd mj-bookmark-pwa
cp .env.example .env
docker compose up --build
```

Anwendung im Browser öffnen:

👉 **http://127.0.0.1**

---

## ⚙️ Services im System

* **PostgreSQL** – Persistente Datenbank
* **Redis** – Cache & Pub/Sub (Subscriptions)
* **Backend** – Apollo GraphQL Server + Prisma
* **Frontend** – Vue 3 SPA über Nginx inkl. Reverse Proxy

---

## 📜 Lizenz

Dieses Projekt steht unter der **MIT License**.  
Siehe [LICENSE.md](LICENSE.md).

---

🚀 **Viel Spaß beim Organisieren deiner Lesezeichen!**

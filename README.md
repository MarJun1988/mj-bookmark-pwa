# 🔖 MJ-Bookmark-PWA

**MJ-Bookmark-PWA** ist eine moderne, selbst-gehostete **Bookmark- & Startseiten-Web-App**.  
Sie dient als persönliche oder teaminterne Startseite mit Tabs, Gruppen, Lesezeichen, Tags und Widgets – optimiert für
Desktop, Tablet und mobile Geräte.

Das Projekt ist **Docker-first**, API-getrieben (GraphQL) und vollständig **Self-Hosted-ready**.

---

## ✨ Features

- 📑 **Tabs & Gruppen** zur strukturierten Organisation
- 🔖 **Lesezeichen (Bookmarks)** mit automatischem Favicon-Fetch
- 🏷️ **Tags** inkl. Mehrfachzuweisung & Filter
- 🔍 **Globale Suche / Command Palette**
- 🔄 **Drag & Drop** (Tabs, Gruppen, Einträge)
- ⚡ **Live-Updates** via GraphQL Subscriptions
- 🧠 **Offline-fähig (PWA-ready)**
- 🐳 **Docker-first Architektur**
- 🤖 **CI/CD-fähig (GitLab)**
- 🔐 **JWT + Refresh-Token Authentifizierung**
- 🪪 **OpenID Connect Login**, z. B. über Authentik

---

## 🏗️ Architektur

| Ebene          | Technologie                                 |
| -------------- | ------------------------------------------- |
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

### Optional: Authentik / OpenID Connect

Lege in Authentik eine OAuth2/OpenID-Connect-Anwendung mit dem
**Authorization Code Flow** an. Trage als Redirect URI ein:

```text
https://deine-bookmark-domain.example/api/auth/oidc/callback
```

Setze anschließend mindestens diese Variablen in deiner `.env`:

```dotenv
OIDC_ISSUER=https://auth.example.de/application/o/bookmark/
OIDC_CLIENT_ID=deine-client-id
OIDC_CLIENT_SECRET=dein-client-secret
OIDC_REDIRECT_URI=https://deine-bookmark-domain.example/api/auth/oidc/callback
LOCAL_AUTH_ENABLED=false
OIDC_AUTO_CREATE_USERS=false
```

Die Scopes `openid profile email` sind voreingestellt. Bestehende lokale
Konten werden nur dann automatisch über ihre E-Mail-Adresse verknüpft, wenn
Authentik `email_verified=true` übermittelt. Weitere Optionen sind in
[`.env.example`](.env.example) dokumentiert.

Mit `LOCAL_AUTH_ENABLED=false` werden lokale Anmeldung, Registrierung und
Passwortfunktionen deaktiviert. `OIDC_AUTO_CREATE_USERS=false` verhindert, dass
beim ersten Authentik-Login automatisch neue Benutzer angelegt werden. In
diesem Fall muss ein Benutzer bereits lokal mit derselben bestätigten
E-Mail-Adresse vorhanden oder schon mit Authentik verknüpft sein.

---

## ⚙️ Services im System

- **PostgreSQL** – Persistente Datenbank
- **Redis** – Cache & Pub/Sub (Subscriptions)
- **Backend** – Apollo GraphQL Server + Prisma
- **Frontend** – Vue 3 SPA über Nginx inkl. Reverse Proxy

---

## 📜 Lizenz

Dieses Projekt steht unter der **MIT License**.  
Siehe [LICENSE.md](LICENSE.md).

---

🚀 **Viel Spaß beim Organisieren deiner Lesezeichen!**

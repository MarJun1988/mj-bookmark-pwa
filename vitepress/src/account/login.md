---
title: Login
search:
  keywords:
    - Login
    - Anmeldung
    - Account
    - Benutzerkonto
    - Authentifizierung
---

# 🔐 Login

Über den Login meldest du dich mit deinem bestehenden Benutzerkonto an
und erhältst Zugriff auf deine persönlichen Lesezeichen.

---

## 🧠 Voraussetzungen

Für den Login benötigst du:

- entweder eine registrierte E-Mail-Adresse, dein Passwort und einen bestätigten Account
- oder einen freigeschalteten Authentik-Account, wenn OpenID Connect eingerichtet ist

👉 Falls du noch kein Konto hast, registriere dich zuerst.

---

## 🔑 Anmelden

1. Öffne die Login-Seite
2. Gib deine E-Mail-Adresse ein
3. Gib dein Passwort ein
4. Klicke auf **„Anmelden“**

Bei korrekten Zugangsdaten wirst du direkt zur Übersicht weitergeleitet.

---

## 🪪 Mit Authentik anmelden

Wenn der Betreiber OpenID Connect eingerichtet hat, wird zusätzlich die
Schaltfläche **„Mit Authentik anmelden“** angezeigt. Du wirst zur zentralen
Anmeldung weitergeleitet und kehrst danach automatisch zur Bookmark-App zurück.

Beim Öffnen der Login-Seite prüft die Anwendung zunächst still, ob bereits eine
Authentik-Sitzung besteht. In diesem Fall wirst du ohne erneute Anmeldemaske
direkt zum ursprünglich aufgerufenen Bereich weitergeleitet. Nach einem
bewussten Logout wird dieser automatische Login für den aktuellen Browser-Tab
nicht erneut gestartet.

Beim ersten Login wird ein lokales Benutzerkonto angelegt. Ein bereits
existierendes Konto mit derselben E-Mail-Adresse wird nur automatisch
verknüpft, wenn Authentik die E-Mail als bestätigt übermittelt.

### Verknüpfung entfernen

Unter **Profil → Anmeldekonten** kannst du die Authentik-Verknüpfung wieder
entfernen.

- Besitzt dein Konto bereits ein lokales Passwort, musst du dieses zur
  Bestätigung eingeben.
- Wurde dein Konto ausschließlich über Authentik erstellt, legst du beim
  Trennen zuerst ein lokales Passwort fest.

Dadurch kannst du dich auch nach dem Entfernen der Verknüpfung weiterhin
anmelden.

Wenn der Betreiber die lokale Anmeldung deaktiviert hat, werden Registrierung,
Passwortanmeldung und Passwortänderung ausgeblendet. Die Authentik-Verknüpfung
kann dann nicht entfernt werden, damit der Benutzer sich nicht selbst
aussperrt.

---

## ❌ Fehlgeschlagener Login

Falls die Anmeldung nicht funktioniert, prüfe bitte:

- Ist die E-Mail-Adresse korrekt geschrieben?
- Ist das Passwort korrekt?
- Wurde die E-Mail-Adresse bestätigt?

Bei mehreren fehlgeschlagenen Versuchen kann der Login
kurzzeitig blockiert sein.

---

## 🔁 Passwort vergessen

Wenn du dein Passwort vergessen hast:

1. Klicke auf **„Passwort vergessen“**
2. Gib deine E-Mail-Adresse ein
3. Folge dem Link in der E-Mail

👉 Du kannst anschließend ein neues Passwort vergeben.

---

## 🔒 Sicherheit

- Dein Passwort wird niemals im Klartext gespeichert
- Die Verbindung ist verschlüsselt
- Jeder Login ist an dein Benutzerkonto gebunden

---

## ➡️ Nächster Schritt

- **[Passwort ändern →](/account/password)**
- **[Grundkonzepte →](/guide/basics)**

# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.  
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)  
und folgt der Versionierung nach [Semantic Versioning](https://semver.org/lang/de/).

---

## [2.0.4] – 2026-02-02

### Changed

- Überarbeitung der Seeder-Datei zur Vereinfachung und Stabilisierung des Initial-Setups.
- Refactoring der Seed-Logik für bessere Wartbarkeit und nachvollziehbare Datenstrukturen.

### Fixed

- Stabileres Initialisieren der Datenbank bei leerer oder frisch angelegter Umgebung.

---

## [2.0.3] – 2026-01-27

### Changed

- Anpassung der FooterAppBar:  
  Auf mobilen Geräten wird kein Text mehr angezeigt, um Platz und Lesbarkeit zu verbessern.
- Kleine UI-Optimierungen für mobile Breakpoints.

---

## [2.0.2] – 2026-01-20

### Fixed

- Behebung von Darstellungsproblemen bei Skeleton-Loadern.
- Verbesserte Behandlung von leeren Zuständen (Empty States) in Tabellen und Listen.

### Improved

- Optimierte Ladeabfolge bei initialen GraphQL-Abfragen.

---

## [2.0.1] – 2026-01-14

### Fixed

- Fehlerkorrekturen im Account-Bereich (Passwort ändern, Account löschen).
- Stabilere Fehlerbehandlung bei GraphQL-Mutationen.

### Improved

- Klarere Benutzertexte bei Fehlermeldungen und Bestätigungen.
- Kleinere UX-Verbesserungen in Formularen.

---

## [2.0.0] – 2026-01-01

### Added

- Neues Tab-/Gruppen-/Lesezeichen-Modell.
- Modernisierte Benutzeroberfläche auf Basis von Vue 3, PrimeVue und Tailwind CSS.
- Überarbeitete Account- und Authentifizierungsflows.
- Vorbereitung für PWA-Features und Offline-First-Ansätze.

### Changed

- Grundlegendes Architektur-Refactoring (Frontend & Backend).
- Umstellung auf klar getrennte Verantwortlichkeiten zwischen Tabs, Gruppen und Lesezeichen.

---

## [1.x] – Legacy

### Notes

- Frühere Versionen vor 2.0.0 gelten als Legacy und werden nicht mehr aktiv gepflegt.
- Fokus ab Version 2.x liegt auf Stabilität, Wartbarkeit und moderner UX.

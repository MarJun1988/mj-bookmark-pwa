# Import & Export

Du kannst deinen gesamten Datenbestand jederzeit exportieren und wieder importieren.  
So lassen sich Backups erstellen oder Daten zwischen Instanzen übertragen.

---

## 📦 Export

Über **Profil → Import & Export → Daten exportieren** kannst du eine JSON-Datei herunterladen.

Der Export enthält:

- Tabs
- Gruppen
- Einträge
- Tags
- Reihenfolge

Die Datei ist versioniert und kann später wieder importiert werden.

---

## 📥 Import

Wähle eine zuvor exportierte JSON-Datei aus.

Beim Import stehen zwei Modi zur Verfügung:

### ➕ Anfügen (APPEND)

Bestehende Daten bleiben erhalten.  
Neue Einträge werden ergänzt.

### 🔁 Ersetzen (REPLACE)

Alle bestehenden Tabs, Gruppen und Einträge werden gelöscht und durch die Importdaten ersetzt.

⚠ Diese Aktion kann nicht rückgängig gemacht werden.

---

## 🧠 Duplikat-Erkennung

- Einträge mit identischer URL werden automatisch übersprungen.
- Fehlende Tags werden automatisch erstellt.
- Doppelte Tag-Verknüpfungen werden verhindert.

---

## 📊 Import-Report

Nach dem Import erhältst du eine Übersicht:

- Anzahl importierter Tabs
- Anzahl importierter Gruppen
- Anzahl importierter Einträge
- Anzahl übersprungener Einträge
- Anzahl neu erstellter Tags

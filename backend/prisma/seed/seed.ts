import { prisma } from "../../dist/lib/prisma.js";

const SAMPLE_VERSION = [
  {
    versionNumber: "v1.0.0",
    description:
      "Erste stabile Version des Lesezeichen-Managers mit grundlegender Tab-, Gruppen- und Lesezeichenverwaltung.",
  },
  {
    versionNumber: "v1.5.0",
    description: "Kleinere Bugfixes und interne Verbesserungen für mehr Stabilität im Alltag.",
  },
  {
    versionNumber: "v2.0.0",
    description:
      "Großes Major-Release mit vollständig überarbeiteter Architektur, deutlich besserer Performance und modernisiertem UI/UX-Konzept.",
  },
  {
    versionNumber: "v2.0.1",
    description:
      "UI-Feinschliff im Login-Bereich, verbesserte Formularvalidierung sowie robuster Offline-Fallback bei fehlender Netzwerkverbindung.",
  },
  {
    versionNumber: "v2.0.2",
    description:
      "Fokus auf Stabilität: interne Refactorings, Bugfixes und weitere Glättung der Benutzerführung nach dem 2.0-Release.",
  },
  {
    versionNumber: "v2.0.3",
    description:
      "Verbesserte Account-Verwaltung, stabilere Skeleton- und Empty-States sowie diverse kleinere Bugfixes.",
  },
  {
    versionNumber: "v2.0.4",
    description: "Seeder refactored & Mobile FooterAppBar ohne Textanzeige.",
  },
  {
    versionNumber: "v2.0.5",
    description:
      "UI-Verbesserungen im Item-Dialog (Autoclose & Sortierung), zuverlässiger Favicon-Fetch beim Erstellen von Items sowie neue Funktionen zur automatischen Tag-Erstellung und manuellen Favicon-Neugenerierung. Zusätzlich diverse Code-Qualitäts- und Linting-Optimierungen.",
  },
  {
    versionNumber: "v2.0.6",
    description:
      "Optimierte Docker-Nutzung inklusive automatischem Import von CA-Zertifikaten. Zusätzlich Behebung kleiner UI-Fehler.",
  },
  {
    versionNumber: "v2.0.7",
    description:
      "Im Profil können Nutzer nun ihren gesamten Datenbestand (Tabs, Gruppen und Einträge) exportieren und wieder importieren. Zusätzlich wurden kleinere Fehler behoben und die allgemeine Stabilität weiter verbessert.",
  },
  {
    versionNumber: "v2.0.8",
    description:
      "Hilfe-Dokumentation erweitert. Download-Funktion für alle Favicons eines Benutzers hinzugefügt. Tooling-Umstellung von ESLint auf Oxlint und von Prettier auf Oxformat.",
  },
  {
    versionNumber: "v2.0.9",
    description:
      "Erweiterung der globalen Suche: Sucheinträge können nun per Shift-, Strg- oder Cmd-Klick sowie mittlerer Maustaste in einem neuen Tab geöffnet werden.",
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Versionen erstellen
  await prisma.$transaction(async (tx) => {
    for (const v of SAMPLE_VERSION) {
      await tx.version.upsert({
        where: { versionNumber: v.versionNumber },
        update: { description: v.description },
        create: v,
      });
    }
  });

  // Statistik
  const stats = {
    versions: await prisma.version.count(),
  };

  console.log("\n📊 Seeding completed!");
  console.log("-------------------");

  console.log(`Versions: ${stats.versions}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

#!/bin/sh
set -e

echo "📦 PostgreSQL Backup gestartet: $(date)"

BACKUP_DIR="/backups"

# Mapping von .env → PostgreSQL-Standard-Variablen
export PGHOST="$POSTGRES_HOST"
export PGPORT="$POSTGRES_PORT"
export PGDATABASE="$POSTGRES_DB"
export PGUSER="$POSTGRES_USER"
export PGPASSWORD="$POSTGRES_PASSWORD"

# Optional: nur zu Debug-Zwecken (ohne Passwort!)
echo "🔌 Verbinde zu $PGHOST:$PGPORT / DB=$PGDATABASE / USER=$PGUSER"

# Dateiname
FILENAME="db-$(date +%F-%H-%M).sql"

# Backup
pg_dump > "$BACKUP_DIR/$FILENAME"

echo "✔️ Backup gespeichert als: $FILENAME"

# Alte Backups löschen
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "🧹 Alte Backups gelöscht (älter als 30 Tage)"
echo "✅ Fertig: $(date)"

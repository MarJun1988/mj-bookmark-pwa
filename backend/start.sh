#!/bin/sh

echo "🔐 Importing custom CA certificates..."

if [ -d "/ca-ertificates" ]; then
  cp /ca-ertificates/* /usr/local/share/ca-certificates/ 2>/dev/null || true
  update-ca-certificates
  echo "✅ CA certificates imported from /ca-ertificates"
else
  echo "ℹ️ No CA directory found"
fi

echo "Waiting for database..."
until nc -z db 5432; do
  sleep 1
done

echo "Database reachable"

echo "🧬 Running prisma generate"
npx prisma generate

echo "Running Prisma migrations..."
npx prisma migrate deploy

# Zur auskommentieren, wenn neue Seeder Vorhanden sind.
echo "Running Prisma seed..."
#npx prisma db seed
npm run seed-ts

echo "Starting server..."
node dist/server.js

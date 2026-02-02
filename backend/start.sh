#!/bin/sh

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
npx prisma db seed

echo "Starting server..."
node dist/server.js

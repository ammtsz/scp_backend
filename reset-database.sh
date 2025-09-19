#!/bin/bash

# Database Reset Script for MVP Center Backend
# This script stops, removes, and recreates the PostgreSQL database
# Use this instead of migrations when you want a clean database reset

echo "🔄 Resetting MVP Center Database..."

# Stop the backend if running
echo "🛑 Stopping backend services..."
pkill -f "npm run start" || true

# Stop and remove the existing database container
echo "🗑️  Removing existing database container..."
docker-compose down
docker volume rm mvp-center-backend_postgres_data 2>/dev/null || true

# Restart the database
echo "🚀 Starting fresh database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker exec scp_postgres pg_isready -U docker -d scp_database >/dev/null 2>&1; then
    echo "✅ Database is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Waiting for database... (attempt $attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database failed to start after $max_attempts attempts"
  exit 1
fi

echo "🎉 Database reset complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run start' to start the backend"
echo "2. The database will be recreated with the updated schema"
echo "3. Test your timezone-agnostic scheduled_date and scheduled_time fields"

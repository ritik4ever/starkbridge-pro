#!/bin/bash

echo "🚀 Starting StarkBridge Pro Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
docker-compose down

# Start database services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to start..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Still waiting for PostgreSQL..."
    sleep 3
done

echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to start..."
until docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
    echo "   Still waiting for Redis..."
    sleep 2
done

echo "✅ Redis is ready!"
echo "🎉 Database services are running!"
echo ""
echo "📊 PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "You can now run:"
echo "  cd packages/backend"
echo "  npm run db:seed"
echo "  npm run dev"
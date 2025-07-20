#!/bin/bash

# StarkBridge Pro Deployment Script
set -e

echo "🚀 Deploying StarkBridge Pro..."

# Build and push Docker images
echo "🔨 Building Docker images..."

# Build backend
docker build -t starkbridge-pro/backend:latest -f packages/backend/Dockerfile .

# Build frontend
docker build -t starkbridge-pro/frontend:latest -f packages/frontend/Dockerfile .

# Tag for registry
REGISTRY=${REGISTRY:-your-registry.com}
docker tag starkbridge-pro/backend:latest $REGISTRY/starkbridge-pro/backend:latest
docker tag starkbridge-pro/frontend:latest $REGISTRY/starkbridge-pro/frontend:latest

# Push to registry
echo "📤 Pushing to registry..."
docker push $REGISTRY/starkbridge-pro/backend:latest
docker push $REGISTRY/starkbridge-pro/frontend:latest

# Deploy to Kubernetes
echo "☸️ Deploying to Kubernetes..."

# Apply namespace
kubectl apply -f infrastructure/k8s/namespace.yaml

# Apply secrets (if they exist)
if [ -f "infrastructure/k8s/secrets.yaml" ]; then
    kubectl apply -f infrastructure/k8s/secrets.yaml
fi

# Apply infrastructure
kubectl apply -f infrastructure/k8s/postgres.yaml
kubectl apply -f infrastructure/k8s/redis.yaml

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure..."
kubectl wait --for=condition=ready pod -l app=postgres -n starkbridge-pro --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n starkbridge-pro --timeout=300s

# Run database migrations
echo "🔄 Running database migrations..."
kubectl run migration-job --image=$REGISTRY/starkbridge-pro/backend:latest --restart=Never -n starkbridge-pro -- npm run db:migrate

# Deploy application
kubectl apply -f infrastructure/k8s/backend.yaml
kubectl apply -f infrastructure/k8s/frontend.yaml

# Wait for deployment
echo "⏳ Waiting for deployment..."
kubectl wait --for=condition=available deployment/backend -n starkbridge-pro --timeout=600s
kubectl wait --for=condition=available deployment/frontend -n starkbridge-pro --timeout=600s

echo "✅ Deployment complete!"

# Get service URLs
echo "🌐 Service URLs:"
kubectl get ingress -n starkbridge-pro
#!/bin/bash

# Redis Cluster Setup Script for Social Platform

echo "Starting Redis cluster setup..."

# Wait for all Redis nodes to be ready
sleep 10

# Create the cluster
echo "Creating Redis cluster..."
redis-cli --cluster create \
  127.0.0.1:7001 \
  127.0.0.1:7002 \
  127.0.0.1:7003 \
  127.0.0.1:7004 \
  127.0.0.1:7005 \
  127.0.0.1:7006 \
  --cluster-replicas 1

echo "Redis cluster setup completed!"
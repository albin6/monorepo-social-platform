# Staging Environment Deployment Guide

## Overview
This document outlines the process for deploying the Social Platform to the staging environment. The staging environment is used for testing new features, validating deployments, and ensuring that the platform works correctly before promoting changes to production.

## Infrastructure Overview

### Services
- **Auth Service**: Handles user authentication and authorization
  - Port: 3001
  - Health Check: `/health`
  - Environment: `staging`
  
- **User Profile Service**: Manages user profile data
  - Port: 3002
  - Health Check: `/health`
  - Environment: `staging`
  
- **Websocket Signaling Service**: Real-time communication
  - Port: 3003
  - Health Check: `/health`
  - Environment: `staging`
  
- **Chat Service**: Messaging functionality
  - Port: 3004
  - Health Check: `/health`
  - Environment: `staging`
  
- **Friend Request Service**: Connection management
  - Port: 3005
  - Health Check: `/health`
  - Environment: `staging`
  
- **Notification Service**: Push notifications
  - Port: 3006
  - Health Check: `/health`
  - Environment: `staging`
  
- **Video Call Signaling Service**: Video call signaling
  - Port: 3007
  - Health Check: `/health`
  - Environment: `staging`
  
- **OTP Service**: One-time password generation
  - Port: 3008
  - Health Check: `/health`
  - Environment: `staging`

### Infrastructure Components
- **Database**: PostgreSQL cluster with 3 nodes
- **Cache**: Redis cluster with 3 nodes
- **Message Queue**: Apache Kafka with 3 brokers
- **Storage**: AWS S3 buckets for media files
- **CDN**: CloudFront distributions
- **Monitoring**: Prometheus, Grafana, and CloudWatch

## Deployment Process

### Pre-deployment Steps
1. Ensure all tests pass in the CI pipeline
2. Verify database migrations are ready
3. Confirm infrastructure is healthy
4. Notify team members of scheduled deployment
5. Prepare rollback plan

### Deployment Steps
1. **Update Infrastructure** (if needed):
   ```bash
   cd infra/terraform
   terraform init
   terraform plan -var="environment=staging"
   terraform apply -var="environment=staging" --auto-approve
   ```

2. **Build and Push Docker Images**:
   ```bash
   docker build -t social-platform/auth-service:staging-latest ./apps/services/auth-service
   docker build -t social-platform/user-profile-service:staging-latest ./apps/services/user-profile-service
   # ... repeat for all services
   docker push social-platform/auth-service:staging-latest
   docker push social-platform/user-profile-service:staging-latest
   # ... repeat for all services
   ```

3. **Deploy to Kubernetes**:
   ```bash
   kubectl config use-context staging-cluster
   kubectl apply -k infra/k8s/overlays/staging
   ```

4. **Verify Deployment**:
   ```bash
   kubectl rollout status deployment/auth-service -n social-platform-staging
   kubectl rollout status deployment/user-profile-service -n social-platform-staging
   # ... repeat for all services
   ```

5. **Run Health Checks**:
   ```bash
   curl -s https://staging.social-platform.com/api/auth-service/health
   curl -s https://staging.social-platform.com/api/user-profile-service/health
   # ... repeat for all services
   ```

6. **Run Smoke Tests**:
   ```bash
   npm run test:smoke:staging
   ```

### Post-deployment Steps
1. Monitor application logs for errors
2. Verify all services are responding correctly
3. Test key user flows manually
4. Update monitoring dashboards
5. Document any issues encountered during deployment
6. Notify team members of deployment completion

## Environment Configuration

### Environment Variables
- `NODE_ENV=staging`
- `DB_HOST=staging-social-platform-postgres.cluster-xyz.us-east-1.rds.amazonaws.com`
- `REDIS_URL=rediss://staging-social-platform-redis-001.xyz.ng.0001.use1.cache.amazonaws.com:6379`
- `KAFKA_BROKERS=staging-social-platform-kafka-xyz-1.us-east-1.elb.amazonaws.com:9092, staging-social-platform-kafka-xyz-2.us-east-1.elb.amazonaws.com:9092, staging-social-platform-kafka-xyz-3.us-east-1.elb.amazonaws.com:9092`
- `S3_BUCKET_AVA=staging-social-platform-avatars`
- `S3_BUCKET_CHAT=staging-social-platform-chat-attachments`
- `S3_BUCKET_VIDEO=staging-social-platform-video-recordings`

### Resource Allocation
- **Auth Service**: 512MB RAM, 0.5 CPU
- **User Profile Service**: 512MB RAM, 0.5 CPU
- **Websocket Signaling Service**: 1GB RAM, 1 CPU
- **Chat Service**: 1GB RAM, 1 CPU
- **Friend Request Service**: 512MB RAM, 0.5 CPU
- **Notification Service**: 512MB RAM, 0.5 CPU
- **Video Call Signaling Service**: 1GB RAM, 1 CPU
- **OTP Service**: 512MB RAM, 0.5 CPU

## Monitoring and Observability

### Dashboards
- Grafana: `https://grafana.staging.social-platform.com`
- CloudWatch: AWS Console -> CloudWatch -> Social Platform Staging
- Prometheus: `https://prometheus.staging.social-platform.com`

### Alerts
- CPU utilization > 80%
- Memory usage > 85%
- Error rate > 5%
- Response time > 2s
- Service unavailable

## Rollback Process

In case of deployment failure, follow these steps to rollback:

1. **Immediate Rollback**:
   ```bash
   kubectl rollout undo deployment/auth-service -n social-platform-staging
   kubectl rollout undo deployment/user-profile-service -n social-platform-staging
   # ... repeat for all services
   ```

2. **Verify Rollback**:
   ```bash
   kubectl rollout status deployment/auth-service -n social-platform-staging
   kubectl rollout status deployment/user-profile-service -n social-platform-staging
   # ... repeat for all services
   ```

3. **Monitor Post-Rollback**:
   - Check application logs
   - Run smoke tests
   - Verify key user flows

## Contact Information
- On-call engineer: `oncall@social-platform.com`
- Slack channel: `#staging-deployments`
- Emergency: `#emergency`
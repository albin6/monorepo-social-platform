# Production Environment Deployment Guide

## Overview
This document outlines the process for deploying the Social Platform to the production environment. The production environment is the live environment serving real users. All deployments to production must follow strict procedures to ensure service availability and data integrity.

## Infrastructure Overview

### Services
- **Auth Service**: Handles user authentication and authorization
  - Port: 3001
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **User Profile Service**: Manages user profile data
  - Port: 3002
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **Websocket Signaling Service**: Real-time communication
  - Port: 3003
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **Chat Service**: Messaging functionality
  - Port: 3004
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **Friend Request Service**: Connection management
  - Port: 3005
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **Notification Service**: Push notifications
  - Port: 3006
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **Video Call Signaling Service**: Video call signaling
  - Port: 3007
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%
  
- **OTP Service**: One-time password generation
  - Port: 3008
  - Health Check: `/health`
  - Environment: `production`
  - SLA: 99.9%

### Infrastructure Components
- **Database**: PostgreSQL cluster with 3 nodes (multi-AZ)
- **Cache**: Redis cluster with 6 nodes (multi-AZ)
- **Message Queue**: Apache Kafka with 3 brokers (multi-AZ)
- **Storage**: AWS S3 buckets with cross-region replication
- **CDN**: CloudFront with global edge locations
- **Load Balancer**: Application Load Balancer with SSL termination
- **Monitoring**: Prometheus, Grafana, and CloudWatch with alerting

## Deployment Process

### Pre-deployment Steps
1. Ensure all tests pass in CI/CD pipeline for staging environment
2. Obtain approval from stakeholders
3. Schedule deployment during low-traffic window (typically 2-4 AM EST)
4. Verify database migration scripts are compatible with existing data
5. Ensure rollback plan is ready and tested
6. Notify team members of scheduled maintenance
7. Prepare communication for users if downtime is expected

### Deployment Steps
1. **Update Infrastructure** (if needed):
   ```bash
   cd infra/terraform
   terraform plan -var="environment=production" -out=tfplan
   terraform apply tfplan
   # Verify infrastructure changes
   ```

2. **Blue-Green Deployment Strategy**:
   ```bash
   # Deploy to blue environment
   kubectl config use-context production-cluster
   kubectl apply -k infra/k8s/overlays/production-blue
   # Wait for rollout
   kubectl rollout status deployment/auth-service-blue -n social-platform-production
   # Run pre-flight tests on blue
   npm run test:prod:preflight:blue
   # Switch traffic to blue
   kubectl apply -f infra/k8s/production/blue-green-traffic-switch.yaml
   # Verify traffic switch
   ```

3. **Canary Deployment Strategy** (for minor updates):
   ```bash
   # Deploy to canary
   kubectl apply -f infra/k8s/production/canary-deployment.yaml
   # Gradually increase canary traffic
   kubectl apply -f infra/k8s/production/canary-traffic-20.yaml
   sleep 300  # Monitor for 5 minutes
   kubectl apply -f infra/k8s/production/canary-traffic-50.yaml
   sleep 300  # Monitor for 5 minutes
   kubectl apply -f infra/k8s/production/canary-traffic-100.yaml
   ```

4. **Zero Downtime Deployment**:
   ```bash
   # Perform rolling update
   kubectl set image deployment/auth-service auth-service=social-platform/auth-service:prod-$(git rev-parse --short HEAD)
   kubectl rollout status deployment/auth-service -n social-platform-production
   # Repeat for all services with proper health checks
   ```

5. **Run Post-Deployment Health Checks**:
   ```bash
   # Check all service health
   for service in auth user-profile websocket-signaling chat friend-request notification video-call-signaling otp; do
     curl -f -s https://api.social-platform.com/api/${service}-service/health || echo "Health check failed for ${service}"
   done
   ```

6. **Run Production Smoke Tests**:
   ```bash
   npm run test:smoke:production
   ```

### Post-deployment Steps
1. Monitor application logs for errors
2. Verify all services are responding correctly
3. Check performance metrics
4. Verify business metrics (DAU, MAU, engagement)
5. Update monitoring dashboards
6. Document any issues encountered during deployment
7. Notify team members of deployment completion
8. Monitor for 30 minutes before declaring deployment successful

## Environment Configuration

### Environment Variables
- `NODE_ENV=production`
- `DB_HOST=prod-social-platform-postgres.cluster-xyz.us-east-1.rds.amazonaws.com`
- `REDIS_URL=rediss://prod-social-platform-redis-001.xyz.ng.001.master.use1.cache.amazonaws.com:6379`
- `KAFKA_BROKERS=prod-social-platform-kafka-xyz-1.us-east-1.elb.amazonaws.com:9092, prod-social-platform-kafka-xyz-2.us-east-1.elb.amazonaws.com:9092, prod-social-platform-kafka-xyz-3.us-east-1.elb.amazonaws.com:9092`
- `S3_BUCKET_AVA=prod-social-platform-avatars`
- `S3_BUCKET_CHAT=prod-social-platform-chat-attachments`
- `S3_BUCKET_VIDEO=prod-social-platform-video-recordings`
- `LOG_LEVEL=info`

### Resource Allocation
- **Auth Service**: 1GB RAM, 1 CPU (autoscale 3-10 instances)
- **User Profile Service**: 1GB RAM, 1 CPU (autoscale 3-10 instances)
- **Websocket Signaling Service**: 2GB RAM, 2 CPU (autoscale 5-15 instances)
- **Chat Service**: 2GB RAM, 2 CPU (autoscale 5-15 instances)
- **Friend Request Service**: 1GB RAM, 1 CPU (autoscale 2-8 instances)
- **Notification Service**: 1GB RAM, 1 CPU (autoscale 3-10 instances)
- **Video Call Signaling Service**: 2GB RAM, 2 CPU (autoscale 5-15 instances)
- **OTP Service**: 1GB RAM, 1 CPU (autoscale 2-8 instances)

## Monitoring and Observability

### Dashboards
- Grafana: `https://grafana.social-platform.com`
- CloudWatch: AWS Console -> CloudWatch -> Social Platform Production
- Prometheus: `https://prometheus.social-platform.com`
- APM: `https://apm.social-platform.com`

### Critical Alerts
- API response time > 1s for >5% of requests
- Error rate > 1%
- Database connection pool > 80% utilized
- Cache hit rate < 90%
- CPU utilization > 80% for >5 minutes
- Memory usage > 85% for >5 minutes
- Service downtime
- Database read/write errors

### Business Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Message delivery rate
- Video call success rate
- Registration conversion rate

## Rollback Process

In case of production deployment failure, follow these steps immediately:

1. **Immediate Response** (within 2 minutes):
   - Switch traffic back to previous version
   - Stop the current deployment
   - Alert on-call team

2. **Rollback Execution**:
   ```bash
   # Switch traffic back to green (previous version)
   kubectl apply -f infra/k8s/production/blue-green-previous.yaml
   # Or, for rolling updates:
   kubectl rollout undo deployment/auth-service -n social-platform-production
   kubectl rollout undo deployment/user-profile-service -n social-platform-production
   # ... repeat for all services
   ```

3. **Verification**:
   ```bash
   # Verify services are responding
   for service in auth user-profile websocket-signaling chat friend-request notification video-call-signaling otp; do
     curl -f -s https://api.social-platform.com/api/${service}-service/health || echo "Health check failed for ${service}"
   done
   ```

4. **Communication**:
   - Inform stakeholders of rollback
   - Update incident report
   - Schedule post-mortem meeting

## Security Considerations
- All deployments must be signed and verified
- Security scans must pass before deployment
- Secrets must be stored in AWS Secrets Manager
- Access logs are monitored for security events
- All communications must use TLS 1.3

## Contact Information
- Production on-call engineer: `production-oncall@social-platform.com`
- Site Reliability Engineering: `sre@social-platform.com`
- Slack channel: `#production-alerts`
- Emergency: `#emergency`
- Incident commander: `incidents@social-platform.com`
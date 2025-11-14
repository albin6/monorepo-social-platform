# Environment Configuration Guide

## Overview
This document provides detailed configuration information for different environments in the Social Platform: Development, Staging, and Production. Each environment has different resource allocations, security settings, and operational characteristics.

## Environment Tiers

### Development Environment
The development environment is used by individual developers for local development and testing.

**Characteristics:**
- Local or shared development infrastructure
- Reduced resources and security
- Frequent changes and experimentation
- Accessible only from internal networks

**Configuration:**
- **Database**: PostgreSQL running locally or in development cluster
  - Size: Small (1GB storage)
  - Backup: Daily, retained for 7 days
  - Encryption: Optional
  - Connection: Direct to local instance

- **Cache**: Redis instance with limited memory
  - Memory: 512MB
  - Persistence: Disabled (volatile)
  - Nodes: Single node

- **Message Queue**: Kafka cluster for local development
  - Brokers: 1 (for development)
  - Replication: Disabled
  - Storage: Local disk

- **Storage**: Local storage or shared development S3 bucket
  - Retention: Daily cleanup
  - Encryption: Disabled
  - Access: Read/write for all developers

**Resource Allocation:**
- Auth Service: 256MB RAM, 0.25 CPU
- User Profile Service: 256MB RAM, 0.25 CPU
- All other services: 256MB RAM, 0.25 CPU

**Security:**
- Authentication: Local development tokens
- TLS: Self-signed certificates
- Access: Internal network only
- Secrets: Stored in local .env files

### Staging Environment
The staging environment is used for integration testing, feature validation, and pre-production testing.

**Characteristics:**
- Close replica of production environment
- Used for testing new features before production
- Accessible to QA team and some stakeholders
- Runs in cloud infrastructure

**Configuration:**
- **Database**: PostgreSQL cluster with 3 nodes
  - Size: Medium (50GB storage)
  - Backup: Hourly, retained for 30 days
  - Encryption: Enabled at rest and in transit
  - Connection: Encrypted via SSL

- **Cache**: Redis cluster with 3 nodes
  - Memory: 2GB per node (6GB total)
  - Persistence: Enabled (RDB and AOF)
  - Nodes: 3 for high availability

- **Message Queue**: Kafka cluster with 3 brokers
  - Brokers: 3 for replication
  - Replication: Enabled (factor 3)
  - Storage: SSD-backed EBS volumes

- **Storage**: AWS S3 with development-grade settings
  - Retention: 7-day lifecycle policy
  - Encryption: Enabled (AES-256)
  - Access: Controlled via IAM policies

**Resource Allocation:**
- Auth Service: 512MB RAM, 0.5 CPU (min 2, max 5 instances)
- User Profile Service: 512MB RAM, 0.5 CPU (min 2, max 5 instances)
- Websocket Signaling Service: 1GB RAM, 1 CPU (min 2, max 8 instances)
- Chat Service: 1GB RAM, 1 CPU (min 2, max 8 instances)
- Friend Request Service: 512MB RAM, 0.5 CPU (min 1, max 4 instances)
- Notification Service: 512MB RAM, 0.5 CPU (min 2, max 5 instances)
- Video Call Signaling Service: 1GB RAM, 1 CPU (min 2, max 8 instances)
- OTP Service: 512MB RAM, 0.5 CPU (min 1, max 4 instances)

**Security:**
- Authentication: OAuth with development tokens
- TLS: Valid certificates from ACM
- Access: VPN required or approved IP ranges
- Secrets: AWS Secrets Manager

### Production Environment
The production environment is the live environment serving real users.

**Characteristics:**
- Highest performance and availability requirements
- 99.99% uptime SLA
- Monitored 24/7
- Strict security controls

**Configuration:**
- **Database**: PostgreSQL cluster with 3 nodes (multi-AZ)
  - Size: Large (500GB storage, scalable)
  - Backup: Continuous, retained for 35 days
  - Encryption: Enabled at rest and in transit
  - Connection: Encrypted via SSL with connection pooling

- **Cache**: Redis cluster with 6 nodes (multi-AZ)
  - Memory: 8GB per node (48GB total)
  - Persistence: Enabled (RDB and AOF)
  - Nodes: 6 for high availability and performance

- **Message Queue**: Kafka cluster with 3 brokers (multi-AZ)
  - Brokers: 3 with replication
  - Replication: Enabled (factor 3)
  - Storage: Provisioned IOPS EBS volumes

- **Storage**: AWS S3 with production-grade settings
  - Retention: Long-term with lifecycle policies
  - Encryption: Enabled (KMS-managed keys)
  - Access: Strict IAM policies with MFA

**Resource Allocation:**
- Auth Service: 1GB RAM, 1 CPU (autoscale 5-50 instances)
- User Profile Service: 1GB RAM, 1 CPU (autoscale 5-50 instances)
- Websocket Signaling Service: 2GB RAM, 2 CPU (autoscale 10-100 instances)
- Chat Service: 2GB RAM, 2 CPU (autoscale 10-100 instances)
- Friend Request Service: 1GB RAM, 1 CPU (autoscale 3-30 instances)
- Notification Service: 1GB RAM, 1 CPU (autoscale 5-50 instances)
- Video Call Signaling Service: 2GB RAM, 2 CPU (autoscale 10-100 instances)
- OTP Service: 1GB RAM, 1 CPU (autoscale 3-30 instances)

**Security:**
- Authentication: OAuth with production tokens
- TLS: Valid certificates with HSTS
- Access: Public via CDN with WAF protection
- Secrets: AWS Secrets Manager with KMS encryption

## Environment-Specific Settings

### Database Settings
| Environment | Max Connections | Connection Pool Size | Slow Query Threshold |
|-------------|----------------|---------------------|---------------------|
| Development | 20 | 5 | 1000ms |
| Staging | 100 | 20 | 500ms |
| Production | 500 | 50 | 200ms |

### Cache Settings
| Environment | Max Memory Policy | TTL Default | Replication Lag |
|-------------|-------------------|--------------|-----------------|
| Development | volatile-lru | 30 min | N/A |
| Staging | allkeys-lru | 2 hours | < 100ms |
| Production | allkeys-lru | 1 hour | < 50ms |

### API Rate Limits
| Environment | Requests/Minute | Burst Limit | User Quota |
|-------------|----------------|-------------|------------|
| Development | Unlimited | Unlimited | Unlimited |
| Staging | 1000 | 2000 | Per developer |
| Production | 1000 | 2000 | Per user |

### Logging Levels
| Environment | Log Level | Retention | Delivery |
|-------------|-----------|-----------|----------|
| Development | Debug | 7 days | Local files |
| Staging | Info | 30 days | CloudWatch |
| Production | Info/Warn | 90 days | CloudWatch + S3 |

## Environment Management

### Deployment Process
- **Development**: Individual developers can deploy directly
- **Staging**: Automated CI/CD from main branch
- **Production**: Manual approval required after staging validation

### Monitoring
- **Development**: Local logs and metrics
- **Staging**: Basic CloudWatch and Prometheus monitoring
- **Production**: Full monitoring with alerting and dashboarding

### Backup Strategy
- **Development**: Daily local backups
- **Staging**: Hourly automated backups
- **Production**: Continuous backups with point-in-time recovery

### Security Scanning
- **Development**: Local security scans
- **Staging**: Automated security scanning in CI/CD
- **Production**: Comprehensive security scanning and penetration testing

### Traffic Routing
- **Development**: Direct access to services
- **Staging**: Load balancer with health checks
- **Production**: CDN with WAF, load balancer, and health checks

## Contact Information
- Development: `dev-team@social-platform.com`
- Staging: `qa-team@social-platform.com`
- Production: `sre@social-platform.com`
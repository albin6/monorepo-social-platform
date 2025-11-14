# Redis Cluster Terraform Configuration for Social Platform

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# VPC for Redis cluster
resource "aws_vpc" "redis_vpc" {
  cidr_block           = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "Social Platform Redis VPC"
  }
}

# Subnets for Redis cluster
resource "aws_subnet" "private" {
  count                   = 3
  vpc_id                  = aws_vpc.redis_vpc.id
  cidr_block              = "10.1.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "Social Platform Redis Private Subnet ${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.redis_vpc.id

  tags = {
    Name = "Social Platform Redis IGW"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.redis_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "Social Platform Redis Public Route Table"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security group for Redis cluster
resource "aws_security_group" "redis_sg" {
  name_prefix = "social-platform-redis-"
  description = "Security group for Redis cluster"
  vpc_id      = aws_vpc.redis_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port       = 16379
    to_port         = 16379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Social Platform Redis Security Group"
  }
}

# Security group for application access
resource "aws_security_group" "app" {
  name_prefix = "social-platform-app-access-"
  description = "Security group for application access to Redis"
  vpc_id      = aws_vpc.redis_vpc.id

  egress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.redis_sg.id]
  }

  egress {
    from_port       = 16379
    to_port         = 16379
    protocol        = "tcp"
    security_groups = [aws_security_group.redis_sg.id]
  }

  tags = {
    Name = "Social Platform App Access Security Group"
  }
}

# ElastiCache Subnet Group for Redis
resource "aws_elasticache_subnet_group" "redis" {
  name       = "social-platform-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "Social Platform Redis Subnet Group"
  }
}

# ElastiCache Cluster for Redis
resource "aws_elasticache_replication_group" "redis_cluster" {
  replication_group_id          = "social-platform-redis"
  description                   = "Social Platform Redis Cluster"
  node_type                     = "cache.r6g.large"
  port                          = 6379
  parameter_group_name          = "default.redis7"
  engine_version                = "7.0"
  num_cache_clusters            = 3
  multi_az_enabled              = true
  automatic_failover_enabled    = true
  subnet_group_name             = aws_elasticache_subnet_group.redis.name
  security_group_ids            = [aws_security_group.redis_sg.id]
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = false
  auth_token                    = var.redis_auth_token
  maintenance_window            = "sun:03:00-sun:05:00"
  snapshot_window               = "04:00-06:00"
  snapshot_retention_limit      = 7

  tags = {
    Name = "Social Platform Redis Cluster"
  }
}

# Get availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "redis_auth_token" {
  description = "Redis authentication token"
  type        = string
  sensitive   = true
}

# Outputs
output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.redis_cluster.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "Redis cluster reader endpoint"
  value       = aws_elasticache_replication_group.redis_cluster.reader_endpoint_address
}
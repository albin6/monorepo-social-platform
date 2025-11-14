# Kafka Terraform Configuration for Social Platform

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

# VPC for Kafka cluster
resource "aws_vpc" "kafka_vpc" {
  cidr_block           = "10.2.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "Social Platform Kafka VPC"
  }
}

# Subnets for Kafka cluster
resource "aws_subnet" "private" {
  count                   = 3
  vpc_id                  = aws_vpc.kafka_vpc.id
  cidr_block              = "10.2.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "Social Platform Kafka Private Subnet ${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.kafka_vpc.id

  tags = {
    Name = "Social Platform Kafka IGW"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.kafka_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "Social Platform Kafka Public Route Table"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security group for Kafka cluster
resource "aws_security_group" "kafka_sg" {
  name_prefix = "social-platform-kafka-"
  description = "Security group for Kafka cluster"
  vpc_id      = aws_vpc.kafka_vpc.id

  ingress {
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port       = 2181
    to_port         = 2181
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
    Name = "Social Platform Kafka Security Group"
  }
}

# Security group for application access
resource "aws_security_group" "app" {
  name_prefix = "social-platform-app-access-"
  description = "Security group for application access to Kafka"
  vpc_id      = aws_vpc.kafka_vpc.id

  egress {
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [aws_security_group.kafka_sg.id]
  }

  egress {
    from_port       = 2181
    to_port         = 2181
    protocol        = "tcp"
    security_groups = [aws_security_group.kafka_sg.id]
  }

  tags = {
    Name = "Social Platform App Access Security Group"
  }
}

# MSK Cluster (Managed Kafka)
resource "aws_msk_cluster" "kafka_cluster" {
  cluster_name           = "social-platform-kafka"
  kafka_version          = "3.4.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = aws_subnet.private[*].id
    security_groups = [aws_security_group.kafka_sg.id]
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS_PLAINTEXT"
      in_cluster    = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.kafka_config.arn
    revision = aws_msk_configuration.kafka_config.latest_revision
  }

  tags = {
    Name = "Social Platform Kafka Cluster"
  }
}

# MSK Configuration
resource "aws_msk_configuration" "kafka_config" {
  name = "social-platform-kafka-config"
  kafka_versions = ["3.4.0"]
  server_properties = <<PROPERTIES
auto.create.topics.enable=true
default.replication.factor=3
min.insync.replicas=2
PROPERTIES
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

# Outputs
output "kafka_bootstrap_servers" {
  description = "Kafka bootstrap servers"
  value       = aws_msk_cluster.kafka_cluster.bootstrap_brokers_sasl_iam
}

output "kafka_zookeeper_connect_string" {
  description = "Kafka Zookeeper connect string"
  value       = aws_msk_cluster.kafka_cluster.zookeeper_connect_string
}
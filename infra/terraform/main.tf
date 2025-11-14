# Main Terraform Configuration for Social Platform

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "social-platform-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "social-platform-terraform-locks"
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# VPC for the entire platform
module "vpc" {
  source = "./modules/vpc"
  
  name                 = "social-platform-vpc"
  cidr                 = "10.0.0.0/16"
  availability_zones   = var.availability_zones
  environment          = var.environment
}

# Database module
module "database" {
  source = "./modules/database"
  
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnets
  environment      = var.environment
  db_instance_type = var.db_instance_type
}

# Cache module
module "cache" {
  source = "./modules/cache"
  
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnets
  environment         = var.environment
  cache_instance_type = var.cache_instance_type
}

# Message queue module
module "messaging" {
  source = "./modules/messaging"
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnets
  environment       = var.environment
  msk_instance_type = var.msk_instance_type
}

# Storage module
module "storage" {
  source = "./modules/storage"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
}

# Services module
module "services" {
  source = "./modules/services"
  
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  private_subnets   = module.vpc.private_subnets
  public_subnets    = module.vpc.public_subnets
  db_endpoint       = module.database.db_endpoint
  cache_endpoint    = module.cache.cache_endpoint
  messaging_endpoint = module.messaging.bootstrap_servers
  s3_bucket_names   = module.storage.bucket_names
}

# Security module
module "security" {
  source = "./modules/security"
  
  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

# Monitoring module
module "monitoring" {
  source = "./modules/monitoring"
  
  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

# Variables
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "db_instance_type" {
  description = "Database instance type"
  type        = string
  default     = "db.t3.micro"
}

variable "cache_instance_type" {
  description = "Cache instance type"
  type        = string
  default     = "cache.t3.micro"
}

variable "msk_instance_type" {
  description = "MSK instance type"
  type        = string
  default     = "kafka.m5.large"
}

# Outputs
output "vpc_id" {
  description = "VPC ID for the platform"
  value       = module.vpc.vpc_id
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = module.database.db_endpoint
}

output "cache_endpoint" {
  description = "Cache endpoint"
  value       = module.cache.cache_endpoint
}

output "messaging_endpoint" {
  description = "Messaging endpoint"
  value       = module.messaging.bootstrap_servers
}

output "services_urls" {
  description = "URLs for the deployed services"
  value       = module.services.service_urls
}

output "monitoring_dashboard_url" {
  description = "URL for the monitoring dashboard"
  value       = module.monitoring.dashboard_url
}

output "turn_server_ip" {
  description = "IP of the TURN server"
  value       = module.services.turn_server_ip
}
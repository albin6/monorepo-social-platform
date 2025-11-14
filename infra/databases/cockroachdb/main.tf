# CockroachDB Terraform Configuration for Social Platform

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

# VPC for CockroachDB cluster
resource "aws_vpc" "cockroach_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "Social Platform CockroachDB VPC"
  }
}

# Subnets for CockroachDB cluster
resource "aws_subnet" "private" {
  count                   = 3
  vpc_id                  = aws_vpc.cockroach_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "Social Platform CockroachDB Private Subnet ${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.cockroach_vpc.id

  tags = {
    Name = "Social Platform CockroachDB IGW"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.cockroach_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "Social Platform CockroachDB Public Route Table"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security group for CockroachDB
resource "aws_security_group" "cockroach_sg" {
  name_prefix = "social-platform-cockroach-"
  description = "Security group for CockroachDB cluster"
  vpc_id      = aws_vpc.cockroach_vpc.id

  ingress {
    from_port       = 26257
    to_port         = 26257
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Social Platform CockroachDB Security Group"
  }
}

# Security group for application access
resource "aws_security_group" "app" {
  name_prefix = "social-platform-app-"
  description = "Security group for application access to CockroachDB"
  vpc_id      = aws_vpc.cockroach_vpc.id

  egress {
    from_port       = 26257
    to_port         = 26257
    protocol        = "tcp"
    security_groups = [aws_security_group.cockroach_sg.id]
  }

  tags = {
    Name = "Social Platform App Access Security Group"
  }
}

# EC2 instances for CockroachDB cluster
resource "aws_instance" "cockroach_node" {
  count         = 3
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  key_name      = var.key_pair_name

  subnet_id                   = aws_subnet.private[count.index].id
  vpc_security_group_ids      = [aws_security_group.cockroach_sg.id]
  associate_public_ip_address = true

  user_data = templatefile("cockroach-setup.sh.tftemplate", {
    node_id = count.index + 1
  })

  tags = {
    Name = "Social Platform CockroachDB Node ${count.index + 1}"
  }
}

# Get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
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

variable "key_pair_name" {
  description = "EC2 Key Pair name"
  type        = string
}

# Outputs
output "cockroachdb_nodes" {
  description = "CockroachDB cluster nodes"
  value       = aws_instance.cockroach_node[*].public_ip
}

output "cockroachdb_connection_string" {
  description = "Connection string for CockroachDB cluster"
  value       = "postgresql://root@${join(",", aws_instance.cockroach_node[*].public_ip)}:26257/social_platform?sslmode=disable"
}
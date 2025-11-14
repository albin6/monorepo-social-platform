# Coturn (TURN) Server Terraform Configuration for Social Platform

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

# VPC for Coturn server
resource "aws_vpc" "coturn_vpc" {
  cidr_block           = "10.3.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "Social Platform Coturn VPC"
  }
}

# Public subnet for Coturn server
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.coturn_vpc.id
  cidr_block              = "10.3.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "Social Platform Coturn Public Subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.coturn_vpc.id

  tags = {
    Name = "Social Platform Coturn IGW"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.coturn_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "Social Platform Coturn Public Route Table"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security group for Coturn server
resource "aws_security_group" "coturn_sg" {
  name_prefix = "social-platform-coturn-"
  description = "Security group for Coturn (TURN) server"
  vpc_id      = aws_vpc.coturn_vpc.id

  # STUN/TURN ports
  ingress {
    from_port       = 3478
    to_port         = 3478
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  ingress {
    from_port       = 3478
    to_port         = 3478
    protocol        = "udp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  # STUN/TURN TLS ports
  ingress {
    from_port       = 5349
    to_port         = 5349
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  ingress {
    from_port       = 5349
    to_port         = 5349
    protocol        = "udp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  # Web UI ports
  ingress {
    from_port       = 6080
    to_port         = 6080
    protocol        = "tcp"
    cidr_blocks     = [var.admin_cidr]
  }

  ingress {
    from_port       = 6081
    to_port         = 6081
    protocol        = "tcp"
    cidr_blocks     = [var.admin_cidr]
  }

  # Ephemeral port range for media relay
  ingress {
    from_port       = 49152
    to_port         = 65535
    protocol        = "udp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Social Platform Coturn Security Group"
  }
}

# EC2 instance for Coturn server
resource "aws_instance" "coturn" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.coturn_sg.id]
  subnet_id              = aws_subnet.public.id

  user_data = base64encode(templatefile("coturn-setup.sh.tftemplate", {
    coturn_realm        = var.coturn_realm
    coturn_server_name  = var.coturn_server_name
    coturn_auth_secret  = var.coturn_auth_secret
    coturn_users        = jsonencode(var.coturn_users)
  }))

  tags = {
    Name = "Social Platform Coturn Server"
  }

  depends_on = [aws_internet_gateway.igw]
}

# Elastic IP for Coturn server to ensure consistent external IP
resource "aws_eip" "coturn_eip" {
  instance = aws_instance.coturn.id
  domain   = "vpc"

  tags = {
    Name = "Social Platform Coturn EIP"
  }

  depends_on = [aws_internet_gateway.igw]
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

variable "instance_type" {
  description = "Instance type for Coturn server"
  type        = string
  default     = "t3.medium"
}

variable "key_pair_name" {
  description = "EC2 Key Pair name"
  type        = string
}

variable "admin_cidr" {
  description = "CIDR block for admin access to web UI"
  type        = string
  default     = "0.0.0.0/0"
}

variable "coturn_realm" {
  description = "Coturn realm"
  type        = string
  default     = "social-platform-turn.example.com"
}

variable "coturn_server_name" {
  description = "Coturn server name"
  type        = string
  default     = "social-platform-turn.example.com"
}

variable "coturn_auth_secret" {
  description = "Coturn authentication secret"
  type        = string
  sensitive   = true
}

variable "coturn_users" {
  description = "Map of Coturn users (username -> password)"
  type        = map(string)
  default = {
    "social_user" = "social_password"
    "web_user"    = "web_password"
  }
}

# Outputs
output "coturn_server_public_ip" {
  description = "Public IP of the Coturn server"
  value       = aws_eip.coturn_eip.public_ip
}

output "coturn_server_private_ip" {
  description = "Private IP of the Coturn server"
  value       = aws_instance.coturn.private_ip
}

output "coturn_turn_urls" {
  description = "TURN server URLs"
  value = [
    "turn:${aws_eip.coturn_eip.public_ip}:3478?transport=udp",
    "turn:${aws_eip.coturn_eip.public_ip}:3478?transport=tcp",
    "turns:${aws_eip.coturn_eip.public_ip}:5349?transport=udp",
    "turns:${aws_eip.coturn_eip.public_ip}:5349?transport=tcp"
  ]
}

output "coturn_stun_urls" {
  description = "STUN server URLs"
  value = [
    "stun:${aws_eip.coturn_eip.public_ip}:3478",
    "stuns:${aws_eip.coturn_eip.public_ip}:5349"
  ]
}
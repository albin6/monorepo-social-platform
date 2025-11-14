# Terraform Outputs for Social Platform

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.social_platform.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.social_platform.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "database_subnet_group" {
  description = "Database subnet group name"
  value       = aws_db_subnet_group.social_platform.name
}

# Database Outputs
output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.social_platform.endpoint
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.social_platform.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.social_platform.username
}

# Cache Outputs
output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_replication_group.social_platform.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint"
  value       = aws_elasticache_replication_group.social_platform.reader_endpoint_address
}

# Messaging Outputs
output "kafka_bootstrap_servers" {
  description = "Kafka bootstrap servers"
  value       = aws_msk_cluster.social_platform.bootstrap_brokers_sasl_iam
}

output "kafka_zookeeper_connect_string" {
  description = "Kafka Zookeeper connect string"
  value       = aws_msk_cluster.social_platform.zookeeper_connect_string
}

# Storage Outputs
output "avatars_bucket_name" {
  description = "Name of the avatars bucket"
  value       = aws_s3_bucket.avatars.bucket
}

output "avatars_bucket_arn" {
  description = "ARN of the avatars bucket"
  value       = aws_s3_bucket.avatars.arn
}

output "chat_attachments_bucket_name" {
  description = "Name of the chat attachments bucket"
  value       = aws_s3_bucket.chat_attachments.bucket
}

output "video_recordings_bucket_name" {
  description = "Name of the video recordings bucket"
  value       = aws_s3_bucket.video_recordings.bucket
}

output "logs_bucket_name" {
  description = "Name of the logs bucket"
  value       = aws_s3_bucket.logs.bucket
}

output "avatars_cloudfront_domain" {
  description = "CloudFront domain for avatars"
  value       = aws_cloudfront_distribution.avatars_cf.domain_name
}

# Service Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = aws_api_gateway_deployment.social_platform.invoke_url
}

output "load_balancer_dns" {
  description = "Load balancer DNS name"
  value       = aws_lb.social_platform.dns_name
}

output "load_balancer_arn" {
  description = "Load balancer ARN"
  value       = aws_lb.social_platform.arn
}

# Monitoring Outputs
output "cloudwatch_log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.app_logs.arn
}

output "cloudwatch_alarm_arns" {
  description = "CloudWatch alarm ARNs"
  value       = aws_cloudwatch_metric_alarm.all[*].arn
}

output "grafana_endpoint" {
  description = "Grafana endpoint"
  value       = aws_instance.grafana.public_dns
}

# Security Outputs
output "security_group_ids" {
  description = "Security group IDs"
  value       = aws_security_group.all[*].id
}

output "iam_role_arns" {
  description = "IAM role ARNs"
  value       = aws_iam_role.all[*].arn
}

# TURN Server Outputs
output "coturn_server_public_ip" {
  description = "Public IP of the Coturn server"
  value       = aws_eip.coturn_eip.public_ip
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

# Environment-specific Outputs
output "environment" {
  description = "Deployed environment"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}
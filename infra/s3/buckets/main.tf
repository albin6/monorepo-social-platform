# S3 Bucket Terraform Configuration for Social Platform

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

# S3 bucket for user avatars and profile pictures
resource "aws_s3_bucket" "avatars" {
  bucket = "${var.environment}-social-platform-avatars"

  tags = {
    Name        = "Social Platform Avatars"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "avatars" {
  bucket = aws_s3_bucket.avatars.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "avatars" {
  bucket = aws_s3_bucket.avatars.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "avatars" {
  bucket = aws_s3_bucket.avatars.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket for chat attachments
resource "aws_s3_bucket" "chat_attachments" {
  bucket = "${var.environment}-social-platform-chat-attachments"

  tags = {
    Name        = "Social Platform Chat Attachments"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "chat_attachments" {
  bucket = aws_s3_bucket.chat_attachments.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "chat_attachments" {
  bucket = aws_s3_bucket.chat_attachments.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "chat_attachments" {
  bucket = aws_s3_bucket.chat_attachments.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket for video call recordings
resource "aws_s3_bucket" "video_recordings" {
  bucket = "${var.environment}-social-platform-video-recordings"

  tags = {
    Name        = "Social Platform Video Recordings"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "video_recordings" {
  bucket = aws_s3_bucket.video_recordings.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "video_recordings" {
  bucket = aws_s3_bucket.video_recordings.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "video_recordings" {
  bucket = aws_s3_bucket.video_recordings.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket for logs
resource "aws_s3_bucket" "logs" {
  bucket = "${var.environment}-social-platform-logs"

  tags = {
    Name        = "Social Platform Logs"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "log-retention-rule"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# Bucket policies
resource "aws_s3_bucket_policy" "avatars_policy" {
  bucket = aws_s3_bucket.avatars.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublicReadGetObject"
        Effect = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = "${aws_s3_bucket.avatars.arn}/*"
      },
    ]
  })
}

resource "aws_s3_bucket_policy" "chat_attachments_policy" {
  bucket = aws_s3_bucket.chat_attachments.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublicReadGetObject"
        Effect = "Allow"
        Principal = {
          AWS = var.app_arns
        }
        Action    = "s3:GetObject"
        Resource = "${aws_s3_bucket.chat_attachments.arn}/*"
      },
    ]
  })
}

# CloudFront distribution for avatars (for better performance)
resource "aws_cloudfront_distribution" "avatars_cf" {
  origin {
    domain_name = aws_s3_bucket.avatars.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.avatars.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.avatars_oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.avatars.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "Social Platform Avatars CloudFront"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_identity" "avatars_oai" {
  comment = "Social Platform Avatars OAI"
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "app_arns" {
  description = "List of ARNs that can access the buckets"
  type        = list(string)
}

# Outputs
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
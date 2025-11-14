#!/usr/bin/env python3
"""
S3 Bucket Management Script for Social Platform
"""

import boto3
import json
import argparse
from botocore.exceptions import ClientError


class S3BucketManager:
    def __init__(self, region='us-east-1'):
        self.s3_client = boto3.client('s3', region_name=region)
        self.region = region

    def create_bucket(self, bucket_name, public_read=False):
        """Create an S3 bucket with specified settings"""
        try:
            # Create bucket
            if self.region == 'us-east-1':
                # us-east-1 doesn't require LocationConstraint
                self.s3_client.create_bucket(Bucket=bucket_name)
            else:
                self.s3_client.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': self.region}
                )
            
            print(f"Bucket {bucket_name} created successfully")

            # Enable versioning
            self.s3_client.put_bucket_versioning(
                Bucket=bucket_name,
                VersioningConfiguration={'Status': 'Enabled'}
            )
            print(f"Versioning enabled for {bucket_name}")

            # Apply encryption
            encryption_config = {
                'Rules': [
                    {
                        'ApplyServerSideEncryptionByDefault': {
                            'SSEAlgorithm': 'AES256'
                        },
                        'BucketKeyEnabled': True
                    }
                ]
            }
            self.s3_client.put_bucket_encryption(
                Bucket=bucket_name,
                ServerSideEncryptionConfiguration=encryption_config
            )
            print(f"Encryption enabled for {bucket_name}")

            # Apply public access block (default is to block)
            self.s3_client.put_public_access_block(
                Bucket=bucket_name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': True,
                    'IgnorePublicAcls': True,
                    'BlockPublicPolicy': True,
                    'RestrictPublicBuckets': True
                }
            )
            print(f"Public access blocked for {bucket_name}")

            # If public_read is enabled, modify the public access block
            if public_read:
                self.s3_client.put_public_access_block(
                    Bucket=bucket_name,
                    PublicAccessBlockConfiguration={
                        'BlockPublicAcls': False,
                        'IgnorePublicAcls': False,
                        'BlockPublicPolicy': False,
                        'RestrictPublicBuckets': False
                    }
                )

                # Set bucket policy for public read access
                public_read_policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "PublicReadGetObject",
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": "s3:GetObject",
                            "Resource": f"arn:aws:s3:::{bucket_name}/*"
                        }
                    ]
                }
                self.s3_client.put_bucket_policy(
                    Bucket=bucket_name,
                    Policy=json.dumps(public_read_policy)
                )
                print(f"Public read policy applied to {bucket_name}")

        except ClientError as e:
            print(f"Error creating bucket {bucket_name}: {e}")
            return False
        return True

    def delete_bucket(self, bucket_name, force=False):
        """Delete an S3 bucket (with option to force delete contents)"""
        try:
            if force:
                # List and delete all objects in the bucket
                objects = self.s3_client.list_objects_v2(Bucket=bucket_name)
                if 'Contents' in objects:
                    for obj in objects['Contents']:
                        self.s3_client.delete_object(Bucket=bucket_name, Key=obj['Key'])
                    print(f"Deleted all objects in {bucket_name}")
                
                # Delete all versions (for versioned buckets)
                versions = self.s3_client.list_object_versions(Bucket=bucket_name)
                if 'Versions' in versions:
                    for version in versions['Versions']:
                        self.s3_client.delete_object(
                            Bucket=bucket_name,
                            Key=version['Key'],
                            VersionId=version['VersionId']
                        )
                if 'DeleteMarkers' in versions:
                    for marker in versions['DeleteMarkers']:
                        self.s3_client.delete_object(
                            Bucket=bucket_name,
                            Key=marker['Key'],
                            VersionId=marker['VersionId']
                        )
            
            # Delete the bucket
            self.s3_client.delete_bucket(Bucket=bucket_name)
            print(f"Bucket {bucket_name} deleted successfully")
        except ClientError as e:
            print(f"Error deleting bucket {bucket_name}: {e}")
            return False
        return True

    def list_buckets(self):
        """List all S3 buckets"""
        try:
            response = self.s3_client.list_buckets()
            print("S3 Buckets:")
            for bucket in response['Buckets']:
                print(f"  - {bucket['Name']} (Created: {bucket['CreationDate']})")
        except ClientError as e:
            print(f"Error listing buckets: {e}")

    def set_lifecycle_policy(self, bucket_name, days_to_transition=30, days_to_expire=365):
        """Set lifecycle policy for a bucket"""
        try:
            lifecycle_config = {
                'Rules': [
                    {
                        'ID': 'StandardLifecycleRule',
                        'Status': 'Enabled',
                        'Transitions': [
                            {
                                'Days': days_to_transition,
                                'StorageClass': 'STANDARD_IA'
                            }
                        ],
                        'Expiration': {
                            'Days': days_to_expire
                        }
                    }
                ]
            }
            self.s3_client.put_bucket_lifecycle_configuration(
                Bucket=bucket_name,
                LifecycleConfiguration=lifecycle_config
            )
            print(f"Lifecycle policy set for {bucket_name}")
        except ClientError as e:
            print(f"Error setting lifecycle policy for {bucket_name}: {e}")

    def enable_logging(self, bucket_name, log_bucket, log_prefix="logs/"):
        """Enable server access logging for a bucket"""
        try:
            self.s3_client.put_bucket_logging(
                Bucket=bucket_name,
                BucketLoggingStatus={
                    'LoggingEnabled': {
                        'TargetBucket': log_bucket,
                        'TargetPrefix': f"{log_prefix}{bucket_name}/"
                    }
                }
            )
            print(f"Server access logging enabled for {bucket_name}")
        except ClientError as e:
            print(f"Error enabling logging for {bucket_name}: {e}")


def main():
    parser = argparse.ArgumentParser(description="S3 Bucket Management for Social Platform")
    parser.add_argument("--region", default="us-east-1", help="AWS region")
    parser.add_argument("--action", choices=["create", "delete", "list", "lifecycle", "logging"], required=True)
    parser.add_argument("--bucket-name", help="Name of the bucket")
    parser.add_argument("--public-read", action="store_true", help="Enable public read access")
    parser.add_argument("--log-bucket", help="Target bucket for access logs")
    parser.add_argument("--log-prefix", default="logs/", help="Prefix for log files")
    parser.add_argument("--transition-days", type=int, default=30, help="Days to transition to Standard-IA")
    parser.add_argument("--expire-days", type=int, default=365, help="Days to expire objects")
    parser.add_argument("--force", action="store_true", help="Force deletion by removing contents first")

    args = parser.parse_args()

    manager = S3BucketManager(region=args.region)

    if args.action == "create":
        if not args.bucket_name:
            print("Error: --bucket-name is required for create action")
            return
        manager.create_bucket(args.bucket_name, args.public_read)
    elif args.action == "delete":
        if not args.bucket_name:
            print("Error: --bucket-name is required for delete action")
            return
        manager.delete_bucket(args.bucket_name, args.force)
    elif args.action == "list":
        manager.list_buckets()
    elif args.action == "lifecycle":
        if not args.bucket_name:
            print("Error: --bucket-name is required for lifecycle action")
            return
        manager.set_lifecycle_policy(args.bucket_name, args.transition_days, args.expire_days)
    elif args.action == "logging":
        if not args.bucket_name or not args.log_bucket:
            print("Error: --bucket-name and --log-bucket are required for logging action")
            return
        manager.enable_logging(args.bucket_name, args.log_bucket, args.log_prefix)


if __name__ == "__main__":
    main()
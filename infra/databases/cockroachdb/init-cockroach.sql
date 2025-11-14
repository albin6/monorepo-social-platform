-- CockroachDB Initialization Script for Social Platform

-- Create databases for each service
CREATE DATABASE IF NOT EXISTS auth_service;
CREATE DATABASE IF NOT EXISTS user_profile_service;
CREATE DATABASE IF NOT EXISTS chat_service;
CREATE DATABASE IF NOT EXISTS friend_request_service;
CREATE DATABASE IF NOT EXISTS notification_service;
CREATE DATABASE IF NOT EXISTS otp_service;

-- Create a user with appropriate permissions
CREATE USER IF NOT EXISTS social_user WITH PASSWORD 'social_password';
GRANT ALL ON DATABASE auth_service TO social_user;
GRANT ALL ON DATABASE user_profile_service TO social_user;
GRANT ALL ON DATABASE chat_service TO social_user;
GRANT ALL ON DATABASE friend_request_service TO social_user;
GRANT ALL ON DATABASE notification_service TO social_user;
GRANT ALL ON DATABASE otp_service TO social_user;

-- Enable required extensions
SET CLUSTER SETTING cluster.organization = 'Social Platform';
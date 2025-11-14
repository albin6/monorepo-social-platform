-- PostgreSQL Initialization Script for Social Platform

-- Create databases for each service
CREATE DATABASE auth_service;
CREATE DATABASE user_profile_service;
CREATE DATABASE chat_service;
CREATE DATABASE friend_request_service;
CREATE DATABASE notification_service;
CREATE DATABASE otp_service;

-- Create a user with appropriate permissions
CREATE USER social_user WITH PASSWORD 'social_password';
GRANT ALL PRIVILEGES ON DATABASE auth_service TO social_user;
GRANT ALL PRIVILEGES ON DATABASE user_profile_service TO social_user;
GRANT ALL PRIVILEGES ON DATABASE chat_service TO social_user;
GRANT ALL PRIVILEGES ON DATABASE friend_request_service TO social_user;
GRANT ALL PRIVILEGES ON DATABASE notification_service TO social_user;
GRANT ALL PRIVILEGES ON DATABASE otp_service TO social_user;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
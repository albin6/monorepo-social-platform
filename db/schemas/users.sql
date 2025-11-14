-- Table: users
-- Description: Stores user account information for the social platform

-- Drop table if exists (useful for development/migrations)
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT password_strength CHECK (LENGTH(password_hash) >= 60) -- Assuming bcrypt hash
);

-- Indexes for performance optimization
-- Index on username for login and search operations
CREATE INDEX idx_users_username ON users(username);

-- Index on email for login and account recovery operations
CREATE INDEX idx_users_email ON users(email);

-- Index on verification status for filtering unverified accounts
CREATE INDEX idx_users_verified ON users(is_verified);

-- Index on active status for excluding inactive accounts
CREATE INDEX idx_users_active ON users(is_active);

-- Index on last login for analytics and cleanup operations
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Index on creation date for chronological ordering
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information for the social platform';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.username IS 'Unique username for the user (3-30 characters)';
COMMENT ON COLUMN users.email IS 'Unique email address for the user';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash of the user password';
COMMENT ON COLUMN users.is_verified IS 'Indicates if the email has been verified';
COMMENT ON COLUMN users.is_active IS 'Indicates if the account is active';
COMMENT ON COLUMN users.is_private IS 'Indicates if the profile is private';
COMMENT ON COLUMN users.created_at IS 'Timestamp when the account was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when the account was last updated';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of the last login';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Timestamp until which the account is locked due to failed login attempts';
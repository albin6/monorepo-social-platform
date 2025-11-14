-- Table: user_profiles
-- Description: Stores detailed profile information for users

-- Drop table if exists (useful for development/migrations)
DROP TABLE IF EXISTS user_profiles;

-- Create the user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    location VARCHAR(255),
    website_url VARCHAR(255),
    phone_number VARCHAR(20),
    occupation VARCHAR(100),
    company VARCHAR(100),
    education VARCHAR(255),
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_info_visibility": "friends", "posts_visibility": "public"}',
    notification_preferences JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "sms_notifications": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_user_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT name_length CHECK (LENGTH(first_name) >= 1 AND LENGTH(last_name) >= 1),
    CONSTRAINT valid_date_of_birth CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '13 years'),
    CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'non-binary', 'other', 'prefer-not-to-say')),
    CONSTRAINT valid_phone_format CHECK (phone_number ~* '^[\+]?[1-9][\d]{0,15}$' OR phone_number IS NULL),
    CONSTRAINT valid_website_url CHECK (website_url ~* '^https?://[\w\.-]+(\.[\w\.-]+)+(/.*)?$' OR website_url IS NULL)
);

-- Indexes for performance optimization
-- Index on user_id for quick lookups and joins
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Index on display_name for search operations
CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);

-- Index on location for geographical queries
CREATE INDEX idx_user_profiles_location ON user_profiles(location);

-- Index on creation date for chronological ordering
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Index on name fields for search operations
CREATE INDEX idx_user_profiles_name ON user_profiles(first_name, last_name);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores detailed profile information for users';
COMMENT ON COLUMN user_profiles.id IS 'Unique identifier for the profile';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key reference to the users table';
COMMENT ON COLUMN user_profiles.first_name IS 'User first name';
COMMENT ON COLUMN user_profiles.last_name IS 'User last name';
COMMENT ON COLUMN user_profiles.display_name IS 'Alternative name to display (if different from real name)';
COMMENT ON COLUMN user_profiles.bio IS 'User biography or description';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to the user avatar image';
COMMENT ON COLUMN user_profiles.cover_url IS 'URL to the user cover image';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'User date of birth (must be 13+ years ago)';
COMMENT ON COLUMN user_profiles.gender IS 'User gender identity';
COMMENT ON COLUMN user_profiles.location IS 'User location/geographical information';
COMMENT ON COLUMN user_profiles.website_url IS 'URL to the user personal website';
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number';
COMMENT ON COLUMN user_profiles.occupation IS 'User job title or occupation';
COMMENT ON COLUMN user_profiles.company IS 'User company or organization';
COMMENT ON COLUMN user_profiles.education IS 'User educational background';
COMMENT ON COLUMN user_profiles.privacy_settings IS 'JSON object containing privacy settings';
COMMENT ON COLUMN user_profiles.notification_preferences IS 'JSON object containing notification preferences';
COMMENT ON COLUMN user_profiles.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN user_profiles.updated_at IS 'Timestamp when the profile was last updated';

-- Add comment to the foreign key constraint
COMMENT ON CONSTRAINT fk_user_profiles_user_id ON user_profiles IS 'References the users table, cascading delete when user is deleted';
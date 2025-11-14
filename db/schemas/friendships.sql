-- Table: friendships
-- Description: Stores established friendships between users

-- Drop table if exists (useful for development/migrations)
DROP TABLE IF EXISTS friendships;

-- Create the friendships table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL,
    user2_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT fk_friendships_user1_id FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_user2_id FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_friendships_different_users CHECK (user1_id != user2_id),
    CONSTRAINT chk_friendships_status CHECK (status IN ('active', 'inactive', 'blocked')),
    CONSTRAINT uk_friendships_unique_pair UNIQUE (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)),
    CONSTRAINT chk_friendships_no_self_friendship CHECK (user1_id != user2_id),
    CONSTRAINT chk_friendships_user_order CHECK (user1_id < user2_id)
);

-- Indexes for performance optimization
-- Index on user1_id for quick lookups
CREATE INDEX idx_friendships_user1_id ON friendships(user1_id);

-- Index on user2_id for quick lookups
CREATE INDEX idx_friendships_user2_id ON friendships(user2_id);

-- Index on status for filtering friendships
CREATE INDEX idx_friendships_status ON friendships(status);

-- Combined index on both user IDs for efficient lookups
CREATE INDEX idx_friendships_users ON friendships(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

-- Index on creation date for chronological ordering
CREATE INDEX idx_friendships_created_at ON friendships(created_at);

-- Index on update date for tracking recent changes
CREATE INDEX idx_friendships_updated_at ON friendships(updated_at);

-- Index on ended_at for cleanup operations
CREATE INDEX idx_friendships_ended_at ON friendships(ended_at);

-- Index on both user ID and status for friend list queries
CREATE INDEX idx_friendships_user_status ON friendships(user1_id, status);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_friendships_updated_at 
    BEFORE UPDATE ON friendships 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE friendships IS 'Stores established friendships between users';
COMMENT ON COLUMN friendships.id IS 'Unique identifier for the friendship';
COMMENT ON COLUMN friendships.user1_id IS 'ID of the first user in the friendship (always less than user2_id)';
COMMENT ON COLUMN friendships.user2_id IS 'ID of the second user in the friendship (always greater than user1_id)';
COMMENT ON COLUMN friendships.status IS 'Current status of the friendship (active/inactive/blocked)';
COMMENT ON COLUMN friendships.created_at IS 'Timestamp when the friendship was established';
COMMENT ON COLUMN friendships.updated_at IS 'Timestamp when the friendship record was last updated';
COMMENT ON COLUMN friendships.ended_at IS 'Timestamp when the friendship was ended or deactivated';

-- Add comments to the foreign key constraints
COMMENT ON CONSTRAINT fk_friendships_user1_id ON friendships IS 'References the users table (first user in the friendship)';
COMMENT ON CONSTRAINT fk_friendships_user2_id ON friendships IS 'References the users table (second user in the friendship)';
COMMENT ON CONSTRAINT uk_friendships_unique_pair ON friendships IS 'Ensures only one friendship exists between any pair of users';
COMMENT ON CONSTRAINT chk_friendships_user_order ON friendships IS 'Ensures user1_id is always less than user2_id to maintain consistency';
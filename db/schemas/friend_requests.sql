-- Table: friend_requests
-- Description: Stores friend request information between users

-- Drop table if exists (useful for development/migrations)
DROP TABLE IF EXISTS friend_requests;

-- Create the friend_requests table
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT fk_friend_requests_sender_id FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_requests_receiver_id FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_friend_requests_different_users CHECK (sender_id != receiver_id),
    CONSTRAINT chk_friend_requests_status CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    CONSTRAINT uk_friend_requests_unique_pair UNIQUE (sender_id, receiver_id),
    CONSTRAINT chk_friend_requests_no_self_request CHECK (sender_id != receiver_id)
);

-- Indexes for performance optimization
-- Index on sender_id for viewing sent requests
CREATE INDEX idx_friend_requests_sender_id ON friend_requests(sender_id);

-- Index on receiver_id for viewing received requests
CREATE INDEX idx_friend_requests_receiver_id ON friend_requests(receiver_id);

-- Index on status for filtering requests
CREATE INDEX idx_friend_requests_status ON friend_requests(status);

-- Index on creation date for chronological ordering
CREATE INDEX idx_friend_requests_created_at ON friend_requests(created_at);

-- Index on update date for tracking recent activity
CREATE INDEX idx_friend_requests_updated_at ON friend_requests(updated_at);

-- Index on both sender and receiver for quick lookups
CREATE INDEX idx_friend_requests_sender_receiver ON friend_requests(sender_id, receiver_id);

-- Index on status and receiver for notification queries
CREATE INDEX idx_friend_requests_status_receiver ON friend_requests(status, receiver_id);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_friend_requests_updated_at 
    BEFORE UPDATE ON friend_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE friend_requests IS 'Stores friend request information between users';
COMMENT ON COLUMN friend_requests.id IS 'Unique identifier for the friend request';
COMMENT ON COLUMN friend_requests.sender_id IS 'ID of the user who sent the friend request';
COMMENT ON COLUMN friend_requests.receiver_id IS 'ID of the user who received the friend request';
COMMENT ON COLUMN friend_requests.status IS 'Current status of the friend request (pending/accepted/rejected/cancelled)';
COMMENT ON COLUMN friend_requests.message IS 'Optional message included with the friend request';
COMMENT ON COLUMN friend_requests.created_at IS 'Timestamp when the friend request was created';
COMMENT ON COLUMN friend_requests.updated_at IS 'Timestamp when the friend request was last updated';
COMMENT ON COLUMN friend_requests.responded_at IS 'Timestamp when the request was responded to (accepted/rejected)';

-- Add comments to the foreign key constraints
COMMENT ON CONSTRAINT fk_friend_requests_sender_id ON friend_requests IS 'References the users table (sender of the friend request)';
COMMENT ON CONSTRAINT fk_friend_requests_receiver_id ON friend_requests IS 'References the users table (receiver of the friend request)';
COMMENT ON CONSTRAINT uk_friend_requests_unique_pair ON friend_requests IS 'Ensures only one request exists between any pair of users at a time';
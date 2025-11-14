-- Table: notifications
-- Description: Stores user notifications

-- Drop table if exists (useful for development/migrations)
DROP TABLE IF EXISTS notifications;

-- Create the notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_notifications_type CHECK (type IN ('friend_request', 'friend_request_accepted', 'message', 'comment', 'like', 'mention', 'system', 'marketing', 'video_call', 'post_reaction'))
);

-- Indexes for performance optimization
-- Index on user_id for retrieving user notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Index on is_read status for filtering read/unread notifications
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Index on creation date for chronological ordering
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Index on type for filtering by notification category
CREATE INDEX idx_notifications_type ON notifications(type);

-- Combined index for efficient user notification queries
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Combined index for unread notifications by type
CREATE INDEX idx_notifications_user_type_unread ON notifications(user_id, type, is_read) WHERE is_read = FALSE;

-- Index on read_at for cleanup operations
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- Index on expiration date for cleanup operations
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Index for complex notification queries with multiple conditions
CREATE INDEX idx_notifications_complex ON notifications(user_id, type, is_read, created_at);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON COLUMN notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN notifications.user_id IS 'ID of the user receiving the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification (friend_request, message, etc.)';
COMMENT ON COLUMN notifications.title IS 'Title of the notification';
COMMENT ON COLUMN notifications.message IS 'Detailed message content';
COMMENT ON COLUMN notifications.data IS 'Additional data related to the notification in JSONB format';
COMMENT ON COLUMN notifications.is_read IS 'Indicates if the notification has been read by the user';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when the notification was marked as read';
COMMENT ON COLUMN notifications.created_at IS 'Timestamp when the notification was created';
COMMENT ON COLUMN notifications.updated_at IS 'Timestamp when the notification was last updated';
COMMENT ON COLUMN notifications.expires_at IS 'Timestamp when the notification should be automatically deleted';

-- Add comments to the foreign key constraint
COMMENT ON CONSTRAINT fk_notifications_user_id ON notifications IS 'References the users table (recipient of the notification)';
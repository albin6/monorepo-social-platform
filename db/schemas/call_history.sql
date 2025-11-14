-- Table: call_history
-- Description: Stores video and audio call history for users

-- Drop table if exists (useful for development/migrations)
DROP TABLE IF EXISTS call_history;

-- Create the call_history table
CREATE TABLE call_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_session_id VARCHAR(255) UNIQUE NOT NULL,
    caller_id UUID NOT NULL,
    callee_id UUID NOT NULL,
    call_type VARCHAR(20) NOT NULL DEFAULT 'video',
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    call_started_at TIMESTAMP WITH TIME ZONE,
    call_ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    call_initiated_by UUID,
    call_joined_by UUID,
    call_missed_by UUID,
    call_rejected_by UUID,
    call_error_reason VARCHAR(255),
    signaling_server_info JSONB,
    webrtc_stats JSONB,
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_call_history_caller_id FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_call_history_callee_id FOREIGN KEY (callee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_call_history_initiated_by FOREIGN KEY (call_initiated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_history_joined_by FOREIGN KEY (call_joined_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_history_missed_by FOREIGN KEY (call_missed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_history_rejected_by FOREIGN KEY (call_rejected_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_call_history_type CHECK (call_type IN ('video', 'audio')),
    CONSTRAINT chk_call_history_status CHECK (status IN ('initiated', 'ringing', 'connected', 'completed', 'missed', 'rejected', 'cancelled', 'failed')),
    CONSTRAINT chk_call_history_different_users CHECK (caller_id != callee_id),
    CONSTRAINT chk_call_history_end_after_start CHECK (call_ended_at IS NULL OR call_ended_at >= call_started_at),
    CONSTRAINT chk_call_history_duration CHECK (duration_seconds >= 0),
    CONSTRAINT chk_call_history_participation CHECK (
        -- If the call was connected, someone must have joined
        (status = 'connected' AND call_joined_by IS NOT NULL) OR 
        -- If the call was missed, it must have been initiated but not joined
        (status = 'missed' AND call_initiated_by IS NOT NULL AND call_joined_by IS NULL) OR
        -- If the call was rejected, someone must have rejected it
        (status = 'rejected' AND call_rejected_by IS NOT NULL) OR
        -- Other statuses can have various combinations
        status IN ('initiated', 'ringing', 'completed', 'cancelled', 'failed')
    )
);

-- Indexes for performance optimization
-- Index on caller_id for retrieving calls made by a user
CREATE INDEX idx_call_history_caller_id ON call_history(caller_id);

-- Index on callee_id for retrieving calls received by a user
CREATE INDEX idx_call_history_callee_id ON call_history(callee_id);

-- Index on call type for filtering video vs audio calls
CREATE INDEX idx_call_history_type ON call_history(call_type);

-- Index on call status for filtering different call outcomes
CREATE INDEX idx_call_history_status ON call_history(status);

-- Combined index for efficient user call history queries
CREATE INDEX idx_call_history_user_calls ON call_history(caller_id, callee_id, call_started_at);

-- Index on call start time for chronological ordering
CREATE INDEX idx_call_history_started_at ON call_history(call_started_at);

-- Index on call end time for duration-based queries
CREATE INDEX idx_call_history_ended_at ON call_history(call_ended_at);

-- Index on call duration for analytics
CREATE INDEX idx_call_history_duration ON call_history(duration_seconds);

-- Index for calls within a specific time range
CREATE INDEX idx_call_history_time_range ON call_history(call_started_at, call_ended_at);

-- Index on call session ID for quick lookups
CREATE INDEX idx_call_history_session_id ON call_history(call_session_id);

-- Index for calls involving a specific user (either caller or callee)
CREATE INDEX idx_call_history_any_user ON call_history((CASE WHEN caller_id = callee_id THEN caller_id ELSE LEAST(caller_id, callee_id) END));

-- Function to create an index for searching calls by any participant
-- This allows efficient queries for calls where a user was either caller or callee
CREATE INDEX idx_call_history_participants ON call_history(LEAST(caller_id, callee_id), GREATEST(caller_id, callee_id));

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_call_history_updated_at 
    BEFORE UPDATE ON call_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE call_history IS 'Stores video and audio call history for users';
COMMENT ON COLUMN call_history.id IS 'Unique identifier for the call record';
COMMENT ON COLUMN call_history.call_session_id IS 'Unique identifier for the call session';
COMMENT ON COLUMN call_history.caller_id IS 'ID of the user who initiated the call';
COMMENT ON COLUMN call_history.callee_id IS 'ID of the user who received the call';
COMMENT ON COLUMN call_history.call_type IS 'Type of call (video or audio)';
COMMENT ON COLUMN call_history.status IS 'Current status of the call (initiated/ringing/connected/completed/missed/rejected)';
COMMENT ON COLUMN call_history.call_started_at IS 'Timestamp when the call started';
COMMENT ON COLUMN call_history.call_ended_at IS 'Timestamp when the call ended';
COMMENT ON COLUMN call_history.duration_seconds IS 'Duration of the call in seconds';
COMMENT ON COLUMN call_history.call_initiated_by IS 'ID of the user who initiated the call (if different from caller_id in case of group calls)';
COMMENT ON COLUMN call_history.call_joined_by IS 'ID of the user who joined the call';
COMMENT ON COLUMN call_history.call_missed_by IS 'ID of the user who missed the call';
COMMENT ON COLUMN call_history.call_rejected_by IS 'ID of the user who rejected the call';
COMMENT ON COLUMN call_history.call_error_reason IS 'Reason for call failure if status is failed';
COMMENT ON COLUMN call_history.signaling_server_info IS 'Information about the signaling server used for the call';
COMMENT ON COLUMN call_history.webrtc_stats IS 'WebRTC statistics and quality metrics for the call';
COMMENT ON COLUMN call_history.recording_url IS 'URL to the call recording if available';
COMMENT ON COLUMN call_history.created_at IS 'Timestamp when the call record was created';
COMMENT ON COLUMN call_history.updated_at IS 'Timestamp when the call record was last updated';

-- Add comments to the foreign key constraints
COMMENT ON CONSTRAINT fk_call_history_caller_id ON call_history IS 'References the users table (initiator of the call)';
COMMENT ON CONSTRAINT fk_call_history_callee_id ON call_history IS 'References the users table (recipient of the call)';
COMMENT ON CONSTRAINT fk_call_history_initiated_by ON call_history IS 'References the users table (user who initiated a group call)';
COMMENT ON CONSTRAINT fk_call_history_joined_by ON call_history IS 'References the users table (user who joined the call)';
COMMENT ON CONSTRAINT fk_call_history_missed_by ON call_history IS 'References the users table (user who missed the call)';
COMMENT ON CONSTRAINT fk_call_history_rejected_by ON call_history IS 'References the users table (user who rejected the call)';
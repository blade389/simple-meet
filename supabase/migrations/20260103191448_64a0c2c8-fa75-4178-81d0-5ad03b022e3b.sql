-- Drop the existing check constraints
ALTER TABLE match_requests DROP CONSTRAINT IF EXISTS match_requests_chat_status_check;
ALTER TABLE match_requests DROP CONSTRAINT IF EXISTS match_requests_status_check;

-- Add new check constraints with additional values
ALTER TABLE match_requests ADD CONSTRAINT match_requests_chat_status_check 
CHECK (chat_status IN ('active', 'blocked', 'under_review', 'closed'));

ALTER TABLE match_requests ADD CONSTRAINT match_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));
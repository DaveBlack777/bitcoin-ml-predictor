-- Create agent_state table if not exists
CREATE TABLE IF NOT EXISTS agent_state (
  agent_id text PRIMARY KEY,
  training_count integer DEFAULT 0,
  last_training_time timestamptz,
  accuracy numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;

-- Create policy
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public access to agent_state" ON agent_state;
  
  CREATE POLICY "Allow public access to agent_state"
    ON agent_state
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_state_updated_at 
  ON agent_state(updated_at);

-- Insert initial state if not exists
INSERT INTO agent_state (agent_id, training_count, last_training_time, accuracy)
VALUES ('bitcoin_predictor', 0, NULL, 0)
ON CONFLICT (agent_id) DO NOTHING;
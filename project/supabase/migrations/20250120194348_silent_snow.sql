-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS models CASCADE;

-- Create models table with proper structure
CREATE TABLE models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  model_data jsonb NOT NULL,
  accuracy numeric DEFAULT 0,
  version text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_models_cryptocurrency ON models(cryptocurrency);
CREATE INDEX idx_models_updated_at ON models(updated_at);
CREATE INDEX idx_models_version ON models(version);

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create policy
DO $$ 
BEGIN
  CREATE POLICY "Allow public access to models"
    ON models
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
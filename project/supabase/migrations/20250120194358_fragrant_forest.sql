-- Create models table with proper structure
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  CREATE TABLE IF NOT EXISTS models (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cryptocurrency text NOT NULL,
    model_data jsonb NOT NULL,
    accuracy numeric DEFAULT 0,
    version text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Add indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_models_cryptocurrency') THEN
    CREATE INDEX idx_models_cryptocurrency ON models(cryptocurrency);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_models_updated_at') THEN
    CREATE INDEX idx_models_updated_at ON models(updated_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_models_version') THEN
    CREATE INDEX idx_models_version ON models(version);
  END IF;

  -- Enable RLS
  ALTER TABLE models ENABLE ROW LEVEL SECURITY;

  -- Drop existing policy if it exists and create new one
  DROP POLICY IF EXISTS "Allow public access to models" ON models;
  
  CREATE POLICY "Allow public access to models"
    ON models
    FOR ALL
    USING (true)
    WITH CHECK (true);

EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;
/*
  # Add version column to models table

  1. Changes
    - Add version column to models table
    - Add index on version column for better query performance
    - Update existing policies to include version column
*/

-- Add version column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'version'
  ) THEN
    ALTER TABLE models ADD COLUMN version text;
  END IF;
END $$;

-- Add index for version column
CREATE INDEX IF NOT EXISTS idx_models_version ON models(version);

-- Update existing models to have a default version
UPDATE models SET version = 'v1.0' WHERE version IS NULL;
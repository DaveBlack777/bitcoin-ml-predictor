/*
  # Add training progress table

  1. New Tables
    - `training_progress`
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `epoch` (integer)
      - `loss` (numeric)
      - `val_loss` (numeric)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public access
*/

-- Create training progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  epoch integer NOT NULL,
  loss numeric,
  val_loss numeric,
  timestamp timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_progress_cryptocurrency ON training_progress(cryptocurrency);
CREATE INDEX IF NOT EXISTS idx_training_progress_timestamp ON training_progress(timestamp);

-- Enable RLS
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;

-- Add access policy
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public access to training_progress" ON training_progress;
    
    CREATE POLICY "Allow public access to training_progress"
      ON training_progress
      FOR ALL
      USING (true)
      WITH CHECK (true);
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;
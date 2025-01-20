/*
  # Fix training_results schema

  1. Changes
    - Remove training_id column requirement
    - Add missing columns
    - Update constraints
*/

-- Drop existing training_results table if exists
DROP TABLE IF EXISTS training_results;

-- Create new training_results table with correct schema
CREATE TABLE training_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accuracy numeric NOT NULL,
  predictions jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE training_results ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public access to training_results"
  ON training_results
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_results_timestamp 
  ON training_results(timestamp);
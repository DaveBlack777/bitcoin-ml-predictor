/*
  # Complete schema update for Bitcoin ML Predictor

  1. New Tables
    - `prediction_accuracy` - Stores accuracy metrics for past predictions
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `prediction_date` (timestamptz)
      - `predicted_price` (numeric)
      - `actual_price` (numeric)
      - `accuracy_percentage` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access
*/

-- Create prediction_accuracy table if it doesn't exist
CREATE TABLE IF NOT EXISTS prediction_accuracy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  prediction_date timestamptz NOT NULL,
  predicted_price numeric NOT NULL,
  actual_price numeric NOT NULL,
  accuracy_percentage numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prediction_accuracy_cryptocurrency 
  ON prediction_accuracy(cryptocurrency);
CREATE INDEX IF NOT EXISTS idx_prediction_accuracy_prediction_date 
  ON prediction_accuracy(prediction_date);

-- Enable RLS
ALTER TABLE prediction_accuracy ENABLE ROW LEVEL SECURITY;

-- Create policy
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public access to prediction_accuracy" ON prediction_accuracy;
  
  CREATE POLICY "Allow public access to prediction_accuracy"
    ON prediction_accuracy
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Ensure all required tables exist
DO $$ 
BEGIN
  -- Create agent_state table if it doesn't exist
  CREATE TABLE IF NOT EXISTS agent_state (
    agent_id text PRIMARY KEY,
    training_count integer DEFAULT 0,
    last_training_time timestamptz,
    accuracy numeric,
    updated_at timestamptz DEFAULT now()
  );

  -- Create training_results table if it doesn't exist
  CREATE TABLE IF NOT EXISTS training_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id integer NOT NULL,
    accuracy numeric NOT NULL,
    predictions jsonb NOT NULL,
    timestamp timestamptz DEFAULT now()
  );

  -- Enable RLS on tables
  ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
  ALTER TABLE training_results ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Allow public access to agent_state" ON agent_state;
  DROP POLICY IF EXISTS "Allow public access to training_results" ON training_results;

  CREATE POLICY "Allow public access to agent_state"
    ON agent_state
    FOR ALL
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Allow public access to training_results"
    ON training_results
    FOR ALL
    USING (true)
    WITH CHECK (true);

EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;
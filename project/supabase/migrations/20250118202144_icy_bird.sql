/*
  # Create agent state and training results tables

  1. New Tables
    - `agent_state`
      - `agent_id` (text, primary key)
      - `training_count` (integer)
      - `last_training_time` (timestamptz)
      - `accuracy` (numeric)
      - `updated_at` (timestamptz)
    
    - `training_results`
      - `id` (uuid, primary key)
      - `training_id` (integer)
      - `accuracy` (numeric)
      - `predictions` (jsonb)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access
*/

-- Create agent_state table
CREATE TABLE IF NOT EXISTS agent_state (
  agent_id text PRIMARY KEY,
  training_count integer DEFAULT 0,
  last_training_time timestamptz,
  accuracy numeric,
  updated_at timestamptz DEFAULT now()
);

-- Create training_results table
CREATE TABLE IF NOT EXISTS training_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id integer NOT NULL,
  accuracy numeric NOT NULL,
  predictions jsonb NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_results ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_results_timestamp 
  ON training_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_training_results_training_id 
  ON training_results(training_id);
/*
  # Update RLS policies for models and predictions tables

  1. Changes
    - Update RLS policies to allow public access for reading and writing
    - Remove authentication requirement for inserting data
    - Keep basic structure intact but modify security policies

  2. Security
    - Enable RLS on both tables
    - Allow public access for both reading and writing
    - Remove authentication requirements since this is a public demo
*/

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  weights jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  predicted_price numeric NOT NULL,
  actual_price numeric NOT NULL
);

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to models" ON models;
DROP POLICY IF EXISTS "Allow authenticated users to insert models" ON models;
DROP POLICY IF EXISTS "Allow public read access to predictions" ON predictions;
DROP POLICY IF EXISTS "Allow authenticated users to insert predictions" ON predictions;

-- Create new policies for models table
CREATE POLICY "Allow public access to models"
  ON models
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for predictions table
CREATE POLICY "Allow public access to predictions"
  ON predictions
  FOR ALL
  USING (true)
  WITH CHECK (true);
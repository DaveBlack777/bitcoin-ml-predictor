/*
  # Create tables for cryptocurrency predictions

  1. New Tables
    - `models` - stores trained model weights
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `weights` (jsonb)
      - `updated_at` (timestamptz)
    
    - `predictions` - stores cryptocurrency price predictions
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `timestamp` (timestamptz)
      - `predicted_price` (numeric)
      - `actual_price` (numeric)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
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

-- Create policies
CREATE POLICY "Allow public read access to models"
  ON models
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to predictions"
  ON predictions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert models"
  ON models
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
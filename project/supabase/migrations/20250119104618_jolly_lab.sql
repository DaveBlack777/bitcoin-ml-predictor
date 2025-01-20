/*
  # Add prediction accuracy tracking

  1. New Tables
    - `prediction_accuracy`
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `prediction_date` (timestamptz)
      - `predicted_price` (numeric)
      - `actual_price` (numeric)
      - `accuracy_percentage` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public access
*/

-- Create prediction_accuracy table
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
CREATE POLICY "Allow public access to prediction_accuracy"
  ON prediction_accuracy
  FOR ALL
  USING (true)
  WITH CHECK (true);
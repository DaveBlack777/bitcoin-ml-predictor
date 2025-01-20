/*
  # Create historical data table

  1. New Tables
    - `historical_data`
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `timestamp` (timestamptz)
      - `price` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public access (if not exists)
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS historical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE historical_data ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists and recreate it
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public access to historical_data" ON historical_data;
    
    CREATE POLICY "Allow public access to historical_data"
      ON historical_data
      FOR ALL
      USING (true)
      WITH CHECK (true);
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;
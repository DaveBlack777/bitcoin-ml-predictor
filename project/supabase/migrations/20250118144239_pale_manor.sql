/*
  # Fix predictions table

  1. Changes
    - Recreate predictions table with proper structure
    - Add proper RLS policies
    - Ensure safe policy creation
*/

-- Recreate predictions table with proper structure
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz NOT NULL,
  predicted_price numeric NOT NULL,
  actual_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Safely recreate the policy
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public access to predictions" ON predictions;
    
    CREATE POLICY "Allow public access to predictions"
      ON predictions
      FOR ALL
      USING (true)
      WITH CHECK (true);
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;
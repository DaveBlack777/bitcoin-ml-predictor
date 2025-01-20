/*
  # Add accuracy column to models table

  1. Changes
    - Add accuracy column to models table
    - Set default value to 0
    - Allow null values for backward compatibility
*/

DO $$ 
BEGIN
  -- Add accuracy column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'accuracy'
  ) THEN
    ALTER TABLE models ADD COLUMN accuracy numeric DEFAULT 0;
  END IF;
END $$;
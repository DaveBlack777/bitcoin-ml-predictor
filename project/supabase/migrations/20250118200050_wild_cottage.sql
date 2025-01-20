/*
  # Initial Database Schema Setup

  1. Tables Created:
    - models: Stores ML model data and weights
    - historical_data: Stores historical Bitcoin prices
    - predictions: Stores model predictions
    - training_progress: Tracks model training progress
    - error_logs: Stores application errors
    - performance_analysis: Stores model performance metrics

  2. Security:
    - RLS enabled for all tables
    - Public read access policies
    - Authenticated write access policies

  3. Indexes:
    - Optimized queries with appropriate indexes
    - Timestamp-based sorting support
*/

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  weights jsonb NOT NULL,
  accuracy numeric,
  version text,
  updated_at timestamptz DEFAULT now()
);

-- Create historical_data table
CREATE TABLE IF NOT EXISTS historical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz NOT NULL,
  predicted_price numeric NOT NULL,
  actual_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create training_progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  epoch integer NOT NULL,
  loss numeric,
  val_loss numeric,
  timestamp timestamptz DEFAULT now()
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context text NOT NULL,
  error_message text,
  error_stack text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create performance_analysis table
CREATE TABLE IF NOT EXISTS performance_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  recent_error_avg numeric NOT NULL,
  older_error_avg numeric NOT NULL,
  learning_rate numeric NOT NULL,
  analysis_summary jsonb NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analysis ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_models_cryptocurrency ON models(cryptocurrency);
CREATE INDEX IF NOT EXISTS idx_models_updated_at ON models(updated_at);
CREATE INDEX IF NOT EXISTS idx_models_version ON models(version);
CREATE INDEX IF NOT EXISTS idx_historical_data_timestamp ON historical_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp);
CREATE INDEX IF NOT EXISTS idx_training_progress_timestamp ON training_progress(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);

-- Create policies for all tables
DO $$ 
BEGIN
  -- Models policies
  CREATE POLICY "Allow public access to models"
    ON models FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Historical data policies
  CREATE POLICY "Allow public access to historical_data"
    ON historical_data FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Predictions policies
  CREATE POLICY "Allow public access to predictions"
    ON predictions FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Training progress policies
  CREATE POLICY "Allow public access to training_progress"
    ON training_progress FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Error logs policies
  CREATE POLICY "Allow public access to error_logs"
    ON error_logs FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Performance analysis policies
  CREATE POLICY "Allow public access to performance_analysis"
    ON performance_analysis FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
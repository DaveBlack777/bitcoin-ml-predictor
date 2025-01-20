/*
  # Dodanie tabeli analizy wydajności

  1. Nowe Tabele
    - `performance_analysis`
      - `id` (uuid, primary key)
      - `cryptocurrency` (text)
      - `timestamp` (timestamptz)
      - `recent_error_avg` (numeric)
      - `older_error_avg` (numeric)
      - `learning_rate` (numeric)
      - `analysis_summary` (jsonb)

  2. Bezpieczeństwo
    - Włączenie RLS
    - Dodanie polityki dostępu publicznego
*/

-- Create performance analysis table
CREATE TABLE IF NOT EXISTS performance_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  recent_error_avg numeric NOT NULL,
  older_error_avg numeric NOT NULL,
  learning_rate numeric NOT NULL,
  analysis_summary jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE performance_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy for performance_analysis table
CREATE POLICY "Allow public access to performance_analysis"
  ON performance_analysis
  FOR ALL
  USING (true)
  WITH CHECK (true);
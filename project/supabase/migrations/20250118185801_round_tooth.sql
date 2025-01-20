/*
  # Dodanie tabeli error_logs

  1. Nowe Tabele
    - `error_logs`
      - `id` (uuid, primary key)
      - `context` (text) - kontekst błędu
      - `error_message` (text) - treść błędu
      - `error_stack` (text) - stack trace błędu
      - `timestamp` (timestamptz) - czas wystąpienia błędu
      - `created_at` (timestamptz) - czas utworzenia wpisu

  2. Bezpieczeństwo
    - Włączenie RLS
    - Polityka dostępu dla odczytu i zapisu
*/

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context text NOT NULL,
  error_message text,
  error_stack text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public access to error_logs"
  ON error_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
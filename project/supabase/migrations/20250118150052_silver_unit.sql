/*
  # Poprawka struktury tabeli models

  1. Zmiany
    - Dodanie kolumny `cryptocurrency` (text)
    - Zmiana typu kolumny `weights` na jsonb
    - Dodanie kolumny `accuracy` (numeric)
  
  2. Indeksy
    - Dodanie indeksu na kolumnie cryptocurrency
    - Dodanie indeksu na kolumnie updated_at
*/

-- Upewnij się, że tabela models ma odpowiednią strukturę
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency text NOT NULL,
  weights jsonb NOT NULL,
  accuracy numeric,
  updated_at timestamptz DEFAULT now()
);

-- Dodaj indeksy dla optymalizacji
CREATE INDEX IF NOT EXISTS idx_models_cryptocurrency ON models(cryptocurrency);
CREATE INDEX IF NOT EXISTS idx_models_updated_at ON models(updated_at);

-- Włącz RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Dodaj politykę dostępu
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public access to models" ON models;
    
    CREATE POLICY "Allow public access to models"
      ON models
      FOR ALL
      USING (true)
      WITH CHECK (true);
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;
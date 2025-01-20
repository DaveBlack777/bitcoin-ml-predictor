import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak wymaganych zmiennych środowiskowych dla Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  db: {
    schema: 'public'
  }
});

// Konfiguracja retry
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Funkcja pomocnicza do wykonywania operacji z mechanizmem retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Wrapper dla operacji Supabase z obsługą retry i typowaniem
export const supabaseWithRetry = {
  from: (table: string) => ({
    select: async (columns: string = '*') => 
      withRetry(() => supabase.from(table).select(columns)),
    insert: async (data: any) => 
      withRetry(() => supabase.from(table).insert(data)),
    update: async (data: any) => 
      withRetry(() => supabase.from(table).update(data)),
    upsert: async (data: any) => 
      withRetry(() => supabase.from(table).upsert(data)),
    delete: async () => 
      withRetry(() => supabase.from(table).delete()),
    eq: async (column: string, value: any) => 
      withRetry(() => supabase.from(table).select('*').eq(column, value)),
    single: async () => 
      withRetry(() => supabase.from(table).select('*').single()),
    order: async (column: string, { ascending = true } = {}) =>
      withRetry(() => supabase.from(table).select('*').order(column, { ascending }))
  })
};
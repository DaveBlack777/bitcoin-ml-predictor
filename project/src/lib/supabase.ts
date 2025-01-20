import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak wymaganych zmiennych środowiskowych dla Supabase');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Funkcja pomocnicza do wykonywania operacji z mechanizmem retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
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

// Typowany wrapper dla Supabase
export const supabaseWithRetry = {
  from: (table: string) => ({
    select: async <T = any>(columns: string = '*') => 
      withRetry<{ data: T[]; error: any }>(() => 
        supabase.from(table).select(columns)
      ),
    insert: async <T = any>(data: any) => 
      withRetry<{ data: T; error: any }>(() => 
        supabase.from(table).insert(data)
      ),
    update: async <T = any>(data: any) => 
      withRetry<{ data: T; error: any }>(() => 
        supabase.from(table).update(data)
      ),
    upsert: async <T = any>(data: any) => 
      withRetry<{ data: T; error: any }>(() => 
        supabase.from(table).upsert(data)
      ),
    delete: async <T = any>() => 
      withRetry<{ data: T; error: any }>(() => 
        supabase.from(table).delete()
      ),
    eq: async <T = any>(column: string, value: any) => 
      withRetry<{ data: T[]; error: any }>(() => 
        supabase.from(table).select('*').eq(column, value)
      ),
    single: async <T = any>() => 
      withRetry<{ data: T; error: any }>(() => 
        supabase.from(table).select('*').single()
      ),
    order: async <T = any>(column: string, { ascending = true } = {}) =>
      withRetry<{ data: T[]; error: any }>(() => 
        supabase.from(table).select('*').order(column, { ascending })
      )
  })
};
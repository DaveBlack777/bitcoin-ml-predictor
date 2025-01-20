export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agent_state: {
        Row: {
          agent_id: string
          training_count: number
          last_training_time: string | null
          accuracy: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          training_count?: number
          last_training_time?: string | null
          accuracy?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          training_count?: number
          last_training_time?: string | null
          accuracy?: number
          updated_at?: string
        }
      }
      training_results: {
        Row: {
          id: string
          accuracy: number
          predictions: Json
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          accuracy: number
          predictions: Json
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          accuracy?: number
          predictions?: Json
          timestamp?: string
          created_at?: string
        }
      }
      historical_data: {
        Row: {
          id: string
          cryptocurrency: string
          timestamp: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          cryptocurrency: string
          timestamp: string
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          cryptocurrency?: string
          timestamp?: string
          price?: number
          created_at?: string
        }
      }
    }
  }
}
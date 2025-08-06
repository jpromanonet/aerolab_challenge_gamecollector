import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  });
}

// Client-side Supabase client
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Server-side Supabase client
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      user_collections: {
        Row: {
          id: string
          user_id: string
          game_id: number
          game_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: number
          game_data: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: number
          game_data?: any
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          avatar_url?: string
          bio?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          avatar_url?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          avatar_url?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
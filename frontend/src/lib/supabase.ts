import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log what's actually loading
console.log('=== SUPABASE DEBUG ===')
console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY exists?', !!supabaseAnonKey)
console.log('VITE_SUPABASE_ANON_KEY first 20 chars:', supabaseAnonKey?.substring(0, 20))

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  throw new Error('Missing Supabase environment variables')
}

// Test if URL is valid
try {
  new URL(supabaseUrl)
  console.log('✅ URL format is valid')
} catch (e) {
  console.error('❌ Invalid URL format:', supabaseUrl)
  throw new Error('Invalid Supabase URL')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error)
  } else {
    console.log('✅ Supabase connected successfully!')
    console.log('Session:', data.session)
  }
})


// Export types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'sme' | 'student'
          matric_number: string | null
          is_verified: boolean
          avatar_url: string | null
          bio: string | null
          skills: string[] | null
          rating: number
          total_jobs: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'sme' | 'student'
          matric_number?: string | null
          is_verified?: boolean
          avatar_url?: string | null
          bio?: string | null
          skills?: string[] | null
          rating?: number
          total_jobs?: number
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          subcategory: string | null
          budget: number
          duration: string | null
          location: string | null
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_by: string
          hired_bid_id: string | null
          created_at: string
          updated_at: string
        }
      }
      bids: {
        Row: {
          id: string
          job_id: string
          student_id: string
          amount: number
          proposal: string
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
          updated_at: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          job_id: string | null
          message: string
          is_read: boolean
          created_at: string
        }
      }
      transactions: {
        Row: {
          id: string
          job_id: string
          amount: number
          reference: string
          status: 'pending' | 'held' | 'released' | 'refunded'
          payer_id: string
          payee_id: string
          paystack_charge_id: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
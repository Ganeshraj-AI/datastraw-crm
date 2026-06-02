import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Diagnostic logging for easy verification
console.log("Vite Supabase URL Loaded:", supabaseUrl)
console.log("Vite Supabase Anon Key Loaded:", supabaseAnonKey)

// Initialize and export the Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
  console.error("Missing or invalid Supabase credentials! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file or Vercel Environment Variables.");
  throw new Error("Supabase credentials missing. App cannot start without VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const isSupabaseConfigured = true;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const getSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase configuration missing: Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in frontend/.env'
    );
  }
  return supabase;
};

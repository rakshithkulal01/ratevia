import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseAdmin = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'Supabase backend credentials missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env'
      );
    }
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
};

export { supabaseAdmin };

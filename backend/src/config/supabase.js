import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseAdmin = null;

export const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase backend credentials missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env or worker environment'
    );
  }

  if (!supabaseAdmin || supabaseAdmin._url !== url) {
    supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    supabaseAdmin._url = url;
  }
  return supabaseAdmin;
};

export { supabaseAdmin };

import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);

export const supabase = hasSupabaseConfig
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

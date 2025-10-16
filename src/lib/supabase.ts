import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

/**
 * Create a Supabase client for read operations using the anon key.
 */
export function createReadonlyClient(): SupabaseClient {
  return createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client for privileged server actions.
 */
export function createServiceClient(): SupabaseClient {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!serviceKey) {
    throw new Error('Missing Supabase service role key.');
  }
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}

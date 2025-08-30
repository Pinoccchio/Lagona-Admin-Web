import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Admin client with service role key for admin operations only
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Singleton for admin client
let adminClient: ReturnType<typeof createAdminClient> | null = null

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createAdminClient()
  }
  return adminClient
}
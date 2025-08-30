import { getSupabaseClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/types'

export const authService = {
  async signIn(email: string, password: string) {
    try {
      console.log('[AuthService] Attempting sign in for:', email)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('[AuthService] Sign in error:', error)
        throw new Error(error.message || 'Authentication failed')
      }
      
      console.log('[AuthService] Sign in successful')
      return data
    } catch (error) {
      console.error('[AuthService] Sign in exception:', error)
      throw error
    }
  },

  async signOut() {
    try {
      console.log('[AuthService] Signing out')
      const supabase = getSupabaseClient()
      
      // Sign out with scope 'global' to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) {
        console.error('[AuthService] Sign out error:', error)
        throw error
      }
      
      // Additional cleanup - clear any local storage items that might persist
      try {
        // Clear common Supabase storage keys
        const keysToRemove = [
          'supabase.auth.token',
          'sb-auth-token', 
          'sb-refresh-token',
          'supabase-auth-token'
        ]
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })
      } catch (storageError) {
        console.warn('[AuthService] Storage cleanup error:', storageError)
      }
      
      console.log('[AuthService] Sign out successful')
    } catch (error) {
      console.error('[AuthService] Sign out exception:', error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const supabase = getSupabaseClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('[AuthService] Get user error:', error)
        throw error
      }
      return user
    } catch (error) {
      console.error('[AuthService] Get user exception:', error)
      throw error
    }
  },

  async signUpAsAdmin(email: string, password: string, fullName: string) {
    try {
      console.log('[AuthService] Attempting admin signup for:', email)
      const adminSupabase = createAdminClient()
      const supabase = getSupabaseClient()
      
      // Step 1: Create Supabase auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'admin'
        }
      })

      if (authError) {
        console.error('[AuthService] Auth user creation error:', authError)
        if (authError.message.includes('User already registered')) {
          throw new Error(`A user with email ${email} already exists. Please use a different email address.`)
        }
        throw new Error(authError.message || 'Failed to create auth account')
      }

      if (!authData.user) {
        throw new Error('Auth account creation failed - no user returned')
      }

      const authUserId = authData.user.id

      try {
        // Step 2: Create user profile using database function
        const { data: profileResult, error: profileError } = await supabase.rpc('create_admin_user', {
          user_id: authUserId,
          user_email: email,
          user_full_name: fullName
        })

        if (profileError) {
          throw new Error(`Failed to create admin profile: ${profileError.message}`)
        }

        const result = profileResult?.[0]
        
        if (!result?.success) {
          throw new Error(result?.message || 'Failed to create admin user profile')
        }

        console.log('[AuthService] Admin signup successful')
        
        // Now sign in the newly created user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          console.warn('[AuthService] Auto sign-in failed after signup:', signInError)
          // Don't throw here, signup was successful, user can manually sign in
        }

        return {
          user: authData.user,
          profile: result,
          signedIn: !signInError
        }

      } catch (profileError) {
        // If profile creation fails, clean up the auth user
        console.error('[AuthService] Profile creation failed, cleaning up auth user:', profileError)
        
        try {
          await adminSupabase.auth.admin.deleteUser(authUserId)
        } catch (cleanupError) {
          console.error('[AuthService] Failed to cleanup auth user:', cleanupError)
        }
        
        throw profileError
      }
      
    } catch (error) {
      console.error('[AuthService] Admin signup exception:', error)
      throw error
    }
  },

  async getCurrentUserProfile() {
    const supabase = getSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) throw userError
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    return { user, profile }
  },

  async getSession() {
    try {
      const supabase = getSupabaseClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[AuthService] Get session error:', error)
        throw error
      }
      return session
    } catch (error) {
      console.error('[AuthService] Get session exception:', error)
      throw error
    }
  }
}
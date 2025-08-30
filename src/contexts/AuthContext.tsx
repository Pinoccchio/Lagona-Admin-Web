'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { authService } from '@/services/authService'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUpAsAdmin: (email: string, password: string, fullName: string) => Promise<{ signedIn: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    let mounted = true
    
    // Simple client-side session check
    const getSession = async () => {
      try {
        console.log('[Auth] Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('[Auth] Session error:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('[Auth] User found:', session.user.id)
          setUser(session.user)
          // Fetch profile but don't block on it
          fetchUserProfile(session.user.id).catch(error => {
            console.warn('[Auth] Profile fetch failed during session check:', error)
          })
        } else {
          console.log('[Auth] No session found')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('[Auth] Session check error:', error)
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initial session check
    getSession()

    // Listen for auth state changes - much simpler
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('[Auth] Auth state change:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          // Fetch profile but don't block on it
          fetchUserProfile(session.user.id).catch(error => {
            console.warn('[Auth] Profile fetch failed during auth state change:', error)
          })
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string): Promise<void> => {
    if (!userId) {
      console.warn('[Auth] No userId provided for profile fetch')
      return
    }

    // Cache check - don't refetch if we already have this user's profile
    if (profile?.id === userId) {
      console.log('[Auth] Profile already cached for user:', userId)
      return
    }

    try {
      console.log('[Auth] Fetching profile for user:', userId)
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Auth] Error fetching user profile:', error.message || error)
        // For login purposes, we can continue without profile
        // Profile is optional for basic auth functionality
        setProfile(null)
        return
      }

      if (userProfile) {
        console.log('[Auth] Profile fetched successfully:', userProfile.full_name)
        setProfile(userProfile)
      } else {
        console.warn('[Auth] No profile data returned')
        setProfile(null)
      }
    } catch (error) {
      console.error('[Auth] Exception fetching user profile:', error)
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[Auth] Signing in...')
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('[Auth] Sign in error:', error)
        throw new Error(error.message)
      }
      
      if (data.user) {
        console.log('[Auth] Sign in successful')
        setUser(data.user)
        // Fetch profile but don't block login on profile fetch failure
        fetchUserProfile(data.user.id).catch(error => {
          console.warn('[Auth] Profile fetch failed during sign in:', error)
        })
      }
    } catch (error) {
      console.error('[Auth] Sign in exception:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUpAsAdmin = async (email: string, password: string, fullName: string) => {
    try {
      console.log('[Auth] Signing up as admin...')
      setLoading(true)
      
      const result = await authService.signUpAsAdmin(email, password, fullName)
      
      if (result.signedIn && result.user) {
        console.log('[Auth] Admin signup and auto sign-in successful')
        setUser(result.user)
        // Fetch profile but don't block on profile fetch failure
        fetchUserProfile(result.user.id).catch(error => {
          console.warn('[Auth] Profile fetch failed during admin signup:', error)
        })
      } else {
        console.log('[Auth] Admin signup successful, but auto sign-in failed')
      }
      
      return { signedIn: result.signedIn }
    } catch (error) {
      console.error('[Auth] Admin signup exception:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('[Auth] Signing out...')
      setLoading(true)
      
      // Clear state immediately
      setUser(null)
      setProfile(null)
      
      // Sign out from Supabase - simple client-side only
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] Sign out error:', error)
        throw error
      }
      
      console.log('[Auth] Sign out successful')
    } catch (error) {
      console.error('[Auth] Sign out exception:', error)
      // Even if signout fails, clear local state
      setUser(null)
      setProfile(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUpAsAdmin,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
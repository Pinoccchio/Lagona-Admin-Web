import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { systemConfigService } from './systemConfigService'

type BusinessHub = Database['public']['Tables']['business_hubs']['Row']
type BusinessHubInsert = Database['public']['Tables']['business_hubs']['Insert']
type BusinessHubUpdate = Database['public']['Tables']['business_hubs']['Update']

export const businessHubService = {
  async getAllBusinessHubs() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_hubs')
      .select(`
        *,
        users (
          email,
          phone_number,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getBusinessHubById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_hubs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getBusinessHubsByStatus(status: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_hubs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createBusinessHub(hub: BusinessHubInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_hubs')
      .insert(hub)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createBusinessHubWithUser(params: {
    name: string;
    municipality: string;
    province: string;
    manager_name: string;
    territory_name?: string;
    user_email?: string;
    user_full_name?: string;
  }) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('create_business_hub_with_user', {
      hub_name: params.name,
      municipality: params.municipality,
      province: params.province,
      manager_name: params.manager_name,
      territory_name: params.territory_name,
      user_email: params.user_email,
      user_full_name: params.user_full_name,
    })

    if (error) throw error
    return data?.[0] // Return the first result
  },

  async createBusinessHubWithInitialLoad(params: {
    name: string;
    municipality: string;
    province: string;
    manager_name: string;
    territory_name?: string;
    initial_load_amount: number;
    user_email?: string;
    user_full_name?: string;
  }) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('create_business_hub_with_initial_load', {
      hub_name: params.name,
      municipality: params.municipality,
      province: params.province,
      manager_name: params.manager_name,
      territory_name: params.territory_name,
      initial_load_amount: params.initial_load_amount,
      user_email: params.user_email,
      user_full_name: params.user_full_name,
    })

    if (error) throw error
    return data?.[0] // Return the first result
  },

  async updateBusinessHub(id: string, updates: BusinessHubUpdate, phone_number?: string) {
    const supabase = createClient()
    
    try {
      // Update business hub
      const { data: hubData, error: hubError } = await supabase
        .from('business_hubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (hubError) throw hubError

      // If phone number is provided, update the associated user's phone number
      if (phone_number !== undefined && hubData) {
        const { error: userError } = await supabase
          .from('users')
          .update({ 
            phone_number: phone_number || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', hubData.user_id)

        if (userError) {
          console.warn('Failed to update user phone number:', userError)
          // Don't throw error here - hub update was successful
        }
      }

      return hubData
    } catch (error) {
      throw error
    }
  },

  async deleteBusinessHub(id: string) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      console.log(`[BusinessHubService] Starting deletion for hub ID: ${id}`)
      
      // Step 1: Use database function to delete all database records
      const { data: deleteResult, error: dbError } = await supabase.rpc('delete_business_hub_complete', {
        hub_id: id
      })

      if (dbError) {
        console.error('[BusinessHubService] Database deletion error:', dbError)
        throw new Error(`Database deletion failed: ${dbError.message}`)
      }

      const result = deleteResult?.[0]
      
      if (!result?.success) {
        throw new Error(result?.message || 'Database deletion failed')
      }

      console.log('[BusinessHubService] Database records deleted successfully:', result.deleted_records)
      
      // Step 2: Delete the Supabase auth user
      if (result.deleted_user_id) {
        try {
          const { error: authError } = await adminSupabase.auth.admin.deleteUser(result.deleted_user_id)
          
          if (authError) {
            console.warn('[BusinessHubService] Auth user deletion failed (non-critical):', authError)
            // Don't throw here - database cleanup was successful
            // Auth user can be cleaned up manually later if needed
          } else {
            console.log('[BusinessHubService] Auth user deleted successfully:', result.deleted_user_id)
          }
        } catch (authDeleteError) {
          console.warn('[BusinessHubService] Auth deletion exception (non-critical):', authDeleteError)
          // Continue - database cleanup was successful
        }
      }

      console.log('[BusinessHubService] Business hub deletion completed successfully')
      
      return {
        success: true,
        deletedRecords: result.deleted_records,
        message: result.message
      }
      
    } catch (error) {
      console.error('[BusinessHubService] Business hub deletion failed:', error)
      throw error
    }
  },

  async getBusinessHubsWithLoadingStations() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_hubs')
      .select(`
        *,
        loading_stations (
          id,
          lscode,
          name,
          area,
          status,
          total_revenue
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getBusinessHubStatistics() {
    const supabase = createClient()
    
    const { data: hubs, error: hubsError } = await supabase
      .from('business_hubs')
      .select('status, total_revenue')

    if (hubsError) throw hubsError

    const totalHubs = hubs?.length || 0
    const activeHubs = hubs?.filter(h => h.status === 'active').length || 0
    const totalRevenue = hubs?.reduce((sum, h) => sum + (h.total_revenue || 0), 0) || 0

    return {
      totalHubs,
      activeHubs,
      totalRevenue,
      pendingHubs: hubs?.filter(h => h.status === 'pending').length || 0
    }
  },

  async createBusinessHubWithAuthAndLoad(params: {
    name: string;
    municipality: string;
    province: string;
    manager_name: string;
    territory_name?: string;
    phone_number?: string;
    initial_load_amount: number;
    email: string;
    password: string;
  }) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      // Step 1: Get current commission rates from system config
      const commissionRates = await systemConfigService.getCommissionRates()
      
      // Step 2: Create the Supabase auth user to get the UUID
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
        user_metadata: {
          full_name: params.manager_name,
          role: 'business_hub'
        }
      })

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes('User already registered')) {
          throw new Error(`A user with email ${params.email} already exists. Please use a different email address.`)
        }
        throw new Error(`Failed to create auth account: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Auth account creation failed - no user returned')
      }

      const authUserId = authData.user.id

      try {
        // Step 3: Use the existing database function and update commission rate separately
        const { data: hubResult, error: hubError } = await supabase.rpc('create_business_hub_with_complete_user_info', {
          auth_user_id: authUserId,
          user_email: params.email,
          user_full_name: params.manager_name,
          hub_name: params.name,
          municipality: params.municipality,
          province: params.province,
          manager_name: params.manager_name,
          user_phone_number: params.phone_number,
          territory_name: params.territory_name,
          initial_load_amount: params.initial_load_amount
        })

        if (hubError) {
          throw new Error(`Failed to create business hub: ${hubError.message}`)
        }

        const result = Array.isArray(hubResult) ? hubResult[0] : hubResult
        
        if (!result?.success) {
          throw new Error(result?.message || 'Business hub creation failed')
        }

        // Update commission rate separately with system-configured value
        const hubRecord = result.hub_record as any
        if (hubRecord?.id) {
          await this.updateBusinessHub(hubRecord.id, { commission_rate: commissionRates.businessHub })
        }

        // Return the hub record from the successful result
        return hubRecord

      } catch (dbError) {
        // If database operations fail, clean up the auth user
        console.error('Database operations failed, cleaning up auth user:', dbError)
        
        try {
          await adminSupabase.auth.admin.deleteUser(authUserId)
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }
        
        // Re-throw the original error with better message
        if (dbError instanceof Error && dbError.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
          throw new Error(`A user with email ${params.email} already exists. Please use a different email address.`)
        }
        
        throw dbError
      }

    } catch (error) {
      console.error('Business hub creation with auth failed:', error)
      throw error
    }
  }
}
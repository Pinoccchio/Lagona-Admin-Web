import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/types'

type LoadingStation = Database['public']['Tables']['loading_stations']['Row']
type LoadingStationInsert = Database['public']['Tables']['loading_stations']['Insert']
type LoadingStationUpdate = Database['public']['Tables']['loading_stations']['Update']

export const loadingStationService = {
  async getAllLoadingStations() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loading_stations')
      .select(`
        *,
        business_hubs (
          id,
          bhcode,
          name,
          municipality
        ),
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

  async getLoadingStationById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loading_stations')
      .select(`
        *,
        business_hubs (
          id,
          bhcode,
          name,
          municipality
        ),
        riders (
          id,
          rcode,
          vehicle_type,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getLoadingStationsByBusinessHub(businessHubId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loading_stations')
      .select('*')
      .eq('business_hub_id', businessHubId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createLoadingStation(station: LoadingStationInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loading_stations')
      .insert(station)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateLoadingStation(id: string, updates: LoadingStationUpdate, phone_number?: string, manager_name?: string) {
    const supabase = createClient()
    
    try {
      // Update loading station
      const { data: stationData, error: stationError } = await supabase
        .from('loading_stations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (stationError) throw stationError

      // If phone number or manager name is provided, update the associated user
      if ((phone_number !== undefined || manager_name !== undefined) && stationData) {
        const userUpdates: any = { updated_at: new Date().toISOString() }
        
        if (phone_number !== undefined) {
          userUpdates.phone_number = phone_number || null
        }
        
        if (manager_name !== undefined && manager_name.trim()) {
          userUpdates.full_name = manager_name.trim()
        }

        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', stationData.user_id)

        if (userError) {
          console.warn('Failed to update user information:', userError)
          // Don't throw error here - station update was successful
        }
      }

      return stationData
    } catch (error) {
      throw error
    }
  },

  async deleteLoadingStation(id: string) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      console.log(`[LoadingStationService] Starting deletion for station ID: ${id}`)
      
      // Step 1: Get station with user info before deletion
      const { data: stationData, error: fetchError } = await supabase
        .from('loading_stations')
        .select(`
          *,
          users (
            id,
            email
          )
        `)
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch station: ${fetchError.message}`)
      }

      if (!stationData) {
        throw new Error('Loading station not found')
      }

      const userId = stationData.user_id

      // Step 2: Delete loading station record (cascading deletes should handle related records)
      const { error: deleteError } = await supabase
        .from('loading_stations')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(`Database deletion failed: ${deleteError.message}`)
      }

      console.log('[LoadingStationService] Database records deleted successfully')
      
      // Step 3: Delete the Supabase auth user
      if (userId) {
        try {
          const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
          
          if (authError) {
            console.warn('[LoadingStationService] Auth user deletion failed (non-critical):', authError)
            // Don't throw here - database cleanup was successful
          } else {
            console.log('[LoadingStationService] Auth user deleted successfully:', userId)
          }
        } catch (authDeleteError) {
          console.warn('[LoadingStationService] Auth deletion exception (non-critical):', authDeleteError)
        }
      }

      console.log('[LoadingStationService] Loading station deletion completed successfully')
      
      return {
        success: true,
        message: 'Loading station deleted successfully'
      }
      
    } catch (error) {
      console.error('[LoadingStationService] Loading station deletion failed:', error)
      throw error
    }
  },

  async getLoadingStationStatistics() {
    const supabase = createClient()
    
    const { data: stations, error: stationsError } = await supabase
      .from('loading_stations')
      .select('status, total_revenue')

    if (stationsError) throw stationsError

    const { data: riders, error: ridersError } = await supabase
      .from('riders')
      .select('id, status')

    if (ridersError) throw ridersError

    const totalStations = stations?.length || 0
    const activeStations = stations?.filter(s => s.status === 'active').length || 0
    const totalRevenue = stations?.reduce((sum, s) => sum + (s.total_revenue || 0), 0) || 0
    const totalRiders = riders?.length || 0
    const activeRiders = riders?.filter(r => r.status === 'active').length || 0

    return {
      totalStations,
      activeStations,
      totalRevenue,
      pendingStations: stations?.filter(s => s.status === 'pending').length || 0,
      totalRiders,
      activeRiders
    }
  },

  async createLoadingStationWithAuth(params: {
    name: string;
    area: string;
    address: string;
    business_hub_id: string;
    commission_rate: number;
    manager_name: string;
    phone_number?: string;
    email: string;
    password: string;
  }) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      // Step 1: Create the Supabase auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
        user_metadata: {
          full_name: params.manager_name,
          role: 'loading_station'
        }
      })

      if (authError) {
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
        // Step 2: Create user record in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            id: authUserId,
            email: params.email,
            full_name: params.manager_name,
            phone_number: params.phone_number,
            role: 'loading_station',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (userError) {
          throw new Error(`Failed to create user record: ${userError.message}`)
        }

        // Step 3: Generate LSCODE (you might want to implement proper LSCODE generation)
        const businessHubBHCODE = await supabase
          .from('business_hubs')
          .select('bhcode')
          .eq('id', params.business_hub_id)
          .single()

        if (!businessHubBHCODE.data) {
          throw new Error('Business hub not found')
        }

        // Simple LSCODE generation - you may want to implement a more sophisticated system
        const timestamp = Date.now().toString().slice(-4)
        const lscode = `${businessHubBHCODE.data.bhcode}-LS${timestamp}`

        // Step 4: Create loading station record
        const { data: stationData, error: stationError } = await supabase
          .from('loading_stations')
          .insert({
            name: params.name,
            area: params.area,
            address: params.address,
            business_hub_id: params.business_hub_id,
            commission_rate: params.commission_rate,
            lscode: lscode,
            user_id: authUserId,
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (stationError) {
          throw new Error(`Failed to create loading station: ${stationError.message}`)
        }

        return stationData

      } catch (dbError) {
        // If database operations fail, clean up the auth user
        console.error('Database operations failed, cleaning up auth user:', dbError)
        
        try {
          await adminSupabase.auth.admin.deleteUser(authUserId)
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }
        
        throw dbError
      }

    } catch (error) {
      console.error('Loading station creation with auth failed:', error)
      throw error
    }
  }
}
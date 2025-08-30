import { createClient } from '@/lib/supabase/client'
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

  async updateLoadingStation(id: string, updates: LoadingStationUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loading_stations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteLoadingStation(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('loading_stations')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
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
  }
}
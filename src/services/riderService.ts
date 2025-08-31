import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Rider {
  id: string;
  user_id: string;
  loading_station_id: string;
  rider_code: string; // RCODE
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone_number: string;
  };
  vehicle_type: 'motorcycle' | 'bicycle' | 'car' | 'tricycle';
  vehicle_details: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
  };
  documents: {
    drivers_license?: string;
    or_cr?: string;
    insurance?: string;
    barangay_clearance?: string;
    police_clearance?: string;
    medical_certificate?: string;
  };
  profile_photo?: string;
  commission_rate: number; // Default 18%
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  total_earnings: number;
  current_balance: number;
  average_rating: number;
  rating_count: number;
  is_online: boolean;
  is_available: boolean;
  current_location?: {
    latitude: number;
    longitude: number;
    updated_at: string;
  };
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface RiderWithLoadingStation extends Rider {
  loading_stations?: {
    id: string;
    loading_station_code: string;
    station_name: string;
    municipality: string;
    barangay: string;
    business_hubs?: {
      hub_name: string;
      municipality: string;
    };
  };
  users?: {
    email: string;
    full_name: string;
    phone_number?: string;
  };
}

export interface RiderApplication {
  id: string;
  loading_station_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  vehicle_type: string;
  documents: {
    drivers_license?: string;
    or_cr?: string;
    insurance?: string;
    barangay_clearance?: string;
    police_clearance?: string;
    medical_certificate?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export const riderService = {
  async getAllRiders(): Promise<RiderWithLoadingStation[]> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('riders')
        .select(`
          *,
          loading_stations!riders_loading_station_id_fkey (
            id,
            lscode,
            name,
            area,
            business_hubs!loading_stations_business_hub_id_fkey (
              name,
              municipality
            )
          ),
          users!riders_user_id_fkey (
            email,
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our interface
      const riders = (data || []).map(rider => ({
        id: rider.id,
        user_id: rider.user_id,
        loading_station_id: rider.loading_station_id,
        rider_code: rider.rcode,
        full_name: rider.users?.full_name || '',
        email: rider.users?.email || '',
        phone_number: rider.users?.phone_number || '',
        address: rider.address || '',
        emergency_contact: rider.emergency_contact || { name: '', relationship: '', phone_number: '' },
        vehicle_type: rider.vehicle_type as 'motorcycle' | 'bicycle' | 'car' | 'tricycle',
        vehicle_details: rider.vehicle_details || {
          brand: '',
          model: '',
          year: 0,
          color: '',
          plate_number: rider.vehicle_plate || ''
        },
        documents: rider.documents || {},
        profile_photo: rider.profile_photo || '',
        commission_rate: rider.commission_rate || 18,
        total_deliveries: rider.total_deliveries || 0,
        completed_deliveries: rider.completed_deliveries || 0,
        cancelled_deliveries: rider.cancelled_deliveries || 0,
        total_earnings: rider.total_earnings || 0,
        current_balance: rider.current_balance || 0,
        average_rating: rider.average_rating || 0,
        rating_count: rider.rating_count || 0,
        is_online: rider.is_online || false,
        is_available: rider.is_available || false,
        current_location: rider.current_location,
        status: rider.status as 'pending' | 'active' | 'inactive' | 'suspended',
        rejection_reason: rider.rejection_reason || '',
        created_at: rider.created_at,
        updated_at: rider.updated_at,
        approved_at: '',
        approved_by: '',
        loading_stations: rider.loading_stations ? {
          id: rider.loading_stations.id,
          loading_station_code: rider.loading_stations.lscode,
          station_name: rider.loading_stations.name,
          municipality: rider.loading_stations.business_hubs?.municipality || '',
          barangay: rider.loading_stations.area,
          business_hubs: rider.loading_stations.business_hubs ? {
            hub_name: rider.loading_stations.business_hubs.name,
            municipality: rider.loading_stations.business_hubs.municipality
          } : undefined
        } : undefined,
        users: rider.users
      }))
      
      return riders
    } catch (error) {
      console.error('Error fetching riders:', error)
      throw error
    }
  },

  async createRider(params: {
    loading_station_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    emergency_contact: {
      name: string;
      relationship: string;
      phone_number: string;
    };
    vehicle_type: string;
    vehicle_details: {
      brand: string;
      model: string;
      year: number;
      color: string;
      plate_number: string;
    };
    documents?: {
      drivers_license?: string;
      or_cr?: string;
      insurance?: string;
      barangay_clearance?: string;
      police_clearance?: string;
      medical_certificate?: string;
    };
  }) {
    const adminSupabase = createAdminClient()
    const supabase = createClient()
    
    try {
      // Step 1: Generate RCODE
      const riderCode = await generateRiderCode()

      // Step 2: Create auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: params.email,
        email_confirm: true,
        user_metadata: {
          full_name: params.full_name,
          role: 'rider'
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create auth user')

      const userId = authData.user.id

      try {
        // Step 3: Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: params.email,
            full_name: params.full_name,
            phone_number: params.phone_number,
            role: 'rider',
            created_at: new Date().toISOString()
          })

        if (userError) throw userError

        // Step 4: Create rider record
        const { data: riderRecord, error: riderError } = await supabase
          .from('riders')
          .insert({
            user_id: userId,
            loading_station_id: params.loading_station_id,
            rcode: riderCode,
            vehicle_type: params.vehicle_type,
            vehicle_plate: params.vehicle_details?.plate_number || null,
            commission_rate: 18,
            total_deliveries: 0,
            total_earnings: 0,
            current_balance: 0,
            status: 'pending'
          })
          .select()
          .single()

        if (riderError) throw riderError
        return riderRecord
      } catch (dbError) {
        // Cleanup auth user if database operations fail
        await adminSupabase.auth.admin.deleteUser(userId)
        throw dbError
      }
    } catch (error) {
      console.error('Error creating rider:', error)
      throw error
    }
  },

  async updateRider(id: string, updates: {
    phone_number?: string;
    address?: string;
    emergency_contact?: {
      name: string;
      relationship: string;
      phone_number: string;
    };
    vehicle_details?: {
      brand: string;
      model: string;
      year: number;
      color: string;
      plate_number: string;
    };
    commission_rate?: number;
    is_available?: boolean;
    status?: 'pending' | 'active' | 'inactive' | 'suspended';
  }) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('riders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating rider:', error)
      throw error
    }
  },

  async approveRider(id: string, approvedBy: string) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('riders')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error approving rider:', error)
      throw error
    }
  },

  async rejectRider(id: string, reason: string, rejectedBy: string) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('riders')
        .update({
          status: 'suspended',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: rejectedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error rejecting rider:', error)
      throw error
    }
  },

  async deleteRider(id: string) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      const { data: rider, error: fetchError } = await supabase
        .from('riders')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!rider) throw new Error('Rider not found')

      // Delete rider record
      const { error: deleteError } = await supabase
        .from('riders')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Delete user record
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', rider.user_id)

      if (userDeleteError) throw userDeleteError

      // Delete auth user
      await adminSupabase.auth.admin.deleteUser(rider.user_id)

      return { success: true }
    } catch (error) {
      console.error('Error deleting rider:', error)
      throw error
    }
  },

  async getRiderStatistics() {
    const riders = await this.getAllRiders()
    
    const totalRiders = riders.length
    const activeRiders = riders.filter(r => r.status === 'active').length
    const pendingRiders = riders.filter(r => r.status === 'pending').length
    const onlineRiders = riders.filter(r => r.is_online && r.status === 'active').length
    const availableRiders = riders.filter(r => r.is_available && r.status === 'active').length
    
    const totalDeliveries = riders.reduce((sum, r) => sum + r.total_deliveries, 0)
    const completedDeliveries = riders.reduce((sum, r) => sum + r.completed_deliveries, 0)
    const totalEarnings = riders.reduce((sum, r) => sum + r.total_earnings, 0)
    const averageRating = riders.length > 0 
      ? riders.reduce((sum, r) => sum + r.average_rating, 0) / riders.length 
      : 0

    // Vehicle type distribution
    const vehicleTypes = riders.reduce((acc, rider) => {
      acc[rider.vehicle_type] = (acc[rider.vehicle_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Loading station distribution
    const loadingStations = riders.reduce((acc, rider) => {
      const stationName = rider.loading_stations?.station_name || 'Unknown'
      acc[stationName] = (acc[stationName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalRiders,
      activeRiders,
      pendingRiders,
      onlineRiders,
      availableRiders,
      totalDeliveries,
      completedDeliveries,
      totalEarnings,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate: totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0,
      vehicleTypes,
      loadingStations
    }
  },

  async updateRiderLocation(riderId: string, location: { latitude: number; longitude: number }) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('riders')
        .update({
          current_location: {
            latitude: location.latitude,
            longitude: location.longitude,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', riderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating rider location:', error)
      throw error
    }
  }
}

// Helper function to generate RCODE
async function generateRiderCode(): Promise<string> {
  // In actual implementation, this would check existing codes and generate unique ones
  const timestamp = Date.now().toString().slice(-6)
  return `RC${timestamp}`
}
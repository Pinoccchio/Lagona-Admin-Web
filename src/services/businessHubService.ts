import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { systemConfigService } from './systemConfigService'
import type { LocationData, TerritoryBounds, BusinessHubFormData, LOCATION_CONSTANTS } from '@/types/location'

// Debug helper function
async function debugAuthState(supabase: any) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Auth session:', session ? 'EXISTS' : 'NULL')
    console.log('Auth error:', error)
    if (session?.user) {
      console.log('User ID:', session.user.id)
      console.log('User email:', session.user.email)
    }
    return session
  } catch (error) {
    console.error('Auth debug error:', error)
    return null
  }
}

type BusinessHub = Database['public']['Tables']['business_hubs']['Row']
type BusinessHubInsert = Database['public']['Tables']['business_hubs']['Insert']
type BusinessHubUpdate = Database['public']['Tables']['business_hubs']['Update']

// Location utility functions
const locationUtils = {
  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const earthRadius = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
      Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  },

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Validate Plus Code format
  validatePlusCode(plusCode: string): boolean {
    const cleanCode = plusCode.toUpperCase().replaceAll(' ', '');
    return /^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2,3}$/.test(cleanCode);
  },

  // Generate Plus Code from coordinates (simplified)
  generatePlusCode(lat: number, lng: number, locality: string): string {
    // Simplified version - in production, use official Plus Codes library
    const latStr = lat.toFixed(4).replace('.', '').substring(0, 4);
    const lngStr = lng.toFixed(4).replace('.', '').substring(0, 4);
    return `${latStr.substring(0, 4)}+${lngStr.substring(0, 3)} ${locality}`;
  },

  // Consolidate location data from various sources
  consolidateLocationData(params: {
    lat: number;
    lng: number;
    formattedAddress: string;
    plusCode?: string;
    accuracyMeters?: number;
    administrative: LocationData['administrative'];
    territoryRadiusKm?: number;
    source?: 'user_selection' | 'geocoded' | 'gps';
    validationStatus?: 'pending' | 'valid' | 'invalid' | 'needs_review';
  }): LocationData {
    const generatedPlusCode = params.plusCode || this.generatePlusCode(
      params.lat,
      params.lng,
      params.administrative.municipality || ''
    );

    return {
      display: params.formattedAddress,
      plus_code: generatedPlusCode,
      coordinates: { lat: params.lat, lng: params.lng },
      accuracy_meters: params.accuracyMeters || 10.0,
      source: params.source || 'geocoded',
      validation_status: params.validationStatus || 'pending',
      administrative: params.administrative,
      territory: {
        radius_km: params.territoryRadiusKm || 15.0,
        is_within_bounds: true,
        distance_from_center: 0.0,
        boundaries: {},
        selected_at: new Date().toISOString(),
      },
    };
  },

  // Check if coordinates are within territory bounds
  isWithinTerritoryBounds(lat: number, lng: number, businessHubLocation: LocationData): boolean {
    if (!businessHubLocation.territory.radius_km || businessHubLocation.territory.radius_km <= 0) {
      return false;
    }

    const distance = this.calculateDistance(
      lat,
      lng,
      businessHubLocation.coordinates.lat,
      businessHubLocation.coordinates.lng
    );

    return distance <= businessHubLocation.territory.radius_km;
  },

  // Generate territory name from administrative data
  generateTerritoryName(administrative: LocationData['administrative']): string {
    const parts = [];
    if (administrative.barangay) parts.push(administrative.barangay);
    if (administrative.district) parts.push(administrative.district);
    if (administrative.municipality) parts.push(administrative.municipality);

    return parts.length > 0 ? parts.join(', ') : 'Territory';
  }
};

export const businessHubService = {
  async getAllBusinessHubs() {
    const supabase = createClient()
    
    try {
      console.log('[businessHubService] Starting getAllBusinessHubs...')
      
      // Debug auth state
      const session = await debugAuthState(supabase)
      
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('[businessHubService] Auth error:', JSON.stringify(authError, null, 2))
        throw new Error(`Authentication error: ${authError.message || 'Unknown auth error'}`)
      }
      
      if (!user) {
        console.error('[businessHubService] No user found - user must be authenticated to access business hubs')
        throw new Error('User not authenticated. Please log in to access business hubs.')
      }
      
      console.log('[businessHubService] Authenticated user:', user.email, 'ID:', user.id)
      
      // Check if user is admin - but don't block if this fails
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.warn('[businessHubService] Profile fetch warning:', JSON.stringify(profileError, null, 2))
          console.log('[businessHubService] Proceeding without role check - user may need profile setup')
        } else {
          console.log('[businessHubService] User role:', userProfile?.role)
        }
      } catch (roleCheckError) {
        console.warn('[businessHubService] Role check failed, proceeding anyway:', roleCheckError)
      }
      
      // Now make the query
      console.log('[businessHubService] Making database query...')
      const { data, error } = await supabase
        .from('business_hubs')
        .select(`
          *,
          users!business_hubs_user_id_fkey (
            email,
            phone_number,
            full_name,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[businessHubService] Database error:', JSON.stringify(error, null, 2))
        console.error('[businessHubService] Error details:', {
          code: error.code || 'No code',
          message: error.message || 'No message',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          status: error.status || 'No status',
          statusText: error.statusText || 'No status text'
        })
        throw new Error(`Database error: ${error.message || JSON.stringify(error)}`)
      }
      
      console.log('[businessHubService] Successfully fetched', data?.length || 0, 'business hubs')
      return data
    } catch (error) {
      console.error('[businessHubService] getAllBusinessHubs error:', JSON.stringify(error, null, 2))
      console.error('[businessHubService] Error type:', typeof error)
      console.error('[businessHubService] Error instance:', error instanceof Error ? 'Error' : 'Other')
      if (error instanceof Error) {
        console.error('[businessHubService] Error message:', error.message)
        console.error('[businessHubService] Error stack:', error.stack)
      }
      throw error
    }
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
      .select(`
        *,
        users!business_hubs_user_id_fkey (
          email,
          phone_number,
          full_name,
          status
        )
      `)
      .eq('users.status', status)
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
      // Update business hub (triggers will handle audit logging and last_modified_by)
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

  async updateBusinessHubStatus(id: string, statusUpdate: {
    status: string;
    notes?: string;
  }) {
    const supabase = createClient()
    
    try {
      // Get current user for audit logging
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required for status updates')
      }

      // Get the business hub to get the user_id
      const { data: currentHub, error: fetchError } = await supabase
        .from('business_hubs')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch business hub: ${fetchError.message}`)
      }

      if (!currentHub.user_id) {
        throw new Error('Business hub has no associated user')
      }

      console.log(`[businessHubService] Updating user status for business hub ${id}:`, {
        hubId: id,
        userId: currentHub.user_id,
        newUserStatus: statusUpdate.status,
        notes: statusUpdate.notes,
        updatedBy: user.email
      })

      // Update only the user status (single source of truth)
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          status: statusUpdate.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentHub.user_id)

      if (userUpdateError) {
        console.error('[businessHubService] Failed to update user status:', userUpdateError)
        throw new Error(`Failed to update account status: ${userUpdateError.message}`)
      }

      // Optional: Update business hub admin notes if provided
      if (statusUpdate.notes) {
        const { error: hubNotesError } = await supabase
          .from('business_hubs')
          .update({
            admin_notes: statusUpdate.notes,
            last_modified_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (hubNotesError) {
          console.warn('[businessHubService] Failed to update hub admin notes (non-critical):', hubNotesError)
        }
      }

      // Fetch the updated data with user status
      const { data: updatedHub, error: refetchError } = await supabase
        .from('business_hubs')
        .select(`
          *,
          users!business_hubs_user_id_fkey (
            email,
            phone_number,
            full_name,
            status
          )
        `)
        .eq('id', id)
        .single()

      if (refetchError) throw refetchError

      console.log(`[businessHubService] Account status updated successfully for hub ${id}:`, {
        userStatus: updatedHub.users?.status,
        notes: statusUpdate.notes,
        updatedBy: user.email,
        timestamp: new Date().toISOString()
      })

      return updatedHub
    } catch (error) {
      console.error('[businessHubService] Status update failed:', error)
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
      .select(`
        total_revenue,
        users!business_hubs_user_id_fkey (
          status
        )
      `)

    if (hubsError) throw hubsError

    const totalHubs = hubs?.length || 0
    const activeHubs = hubs?.filter(h => h.users?.status === 'active').length || 0
    const totalRevenue = hubs?.reduce((sum, h) => sum + (h.total_revenue || 0), 0) || 0

    return {
      totalHubs,
      activeHubs,
      totalRevenue,
      pendingHubs: hubs?.filter(h => h.users?.status === 'pending').length || 0
    }
  },

  // Update business hub with location data
  async updateBusinessHubLocation(id: string, locationData: LocationData) {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('business_hubs')
        .update({
          location: locationData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update location data: ${error}`);
    }
  },

  // Create business hub with enhanced location data
  async createBusinessHubWithLocationData(formData: BusinessHubFormData) {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    try {
      // Step 1: Get commission rates
      const commissionRates = await systemConfigService.getCommissionRates();

      // Step 2: Create auth user
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.manager_name,
          role: 'business_hub'
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error(`A user with email ${formData.email} already exists.`);
        }
        throw new Error(`Failed to create auth account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Auth account creation failed');
      }

      const authUserId = authData.user.id;

      try {
        // Step 3: Generate BHCODE
        const { data: bhcodeData, error: bhcodeError } = await supabase.rpc('generate_bhcode', {
          municipality_name: formData.municipality
        });

        if (bhcodeError) throw bhcodeError;
        const bhcode = bhcodeData as string;

        // Step 4: Create user profile
        const { error: userError } = await supabase.from('users').insert({
          id: authUserId,
          email: formData.email,
          full_name: formData.manager_name,
          phone_number: formData.phone_number,
          role: 'business_hub',
          status: 'pending',
          created_at: new Date().toISOString(),
        });

        if (userError) throw userError;

        // Step 5: Create business hub with location data
        const hubInsert: BusinessHubInsert = {
          user_id: authUserId,
          bhcode,
          name: formData.name,
          municipality: formData.municipality,
          province: formData.province,
          manager_name: formData.manager_name,
          territory_name: formData.territory_name,
          commission_rate: commissionRates.businessHub,
          location: formData.location || {},
          territory_boundaries: formData.territory_boundaries || null,
          admin_notes: formData.admin_notes,
          created_at: new Date().toISOString(),
        };

        const { data: hubData, error: hubError } = await supabase
          .from('business_hubs')
          .insert(hubInsert)
          .select()
          .single();

        if (hubError) throw hubError;

        // Step 6: Create initial load if specified
        if (formData.initial_load_amount && formData.initial_load_amount > 0) {
          const { error: topupError } = await supabase.from('top_ups').insert({
            user_id: authUserId,
            amount: formData.initial_load_amount,
            total_amount: formData.initial_load_amount,
            status: 'completed',
            payment_method: 'admin_load',
            is_initial_load: true,
            processed_at: new Date().toISOString(),
          });

          if (topupError) {
            console.warn('Failed to create initial load:', topupError);
          }

          // Update user balance
          await supabase
            .from('users')
            .update({ current_balance: formData.initial_load_amount })
            .eq('id', authUserId);
        }

        return hubData;

      } catch (dbError) {
        // Cleanup auth user on database failure
        try {
          await adminSupabase.auth.admin.deleteUser(authUserId);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        throw dbError;
      }

    } catch (error) {
      console.error('Business hub creation with location failed:', error);
      throw error;
    }
  },

  // Get business hubs with location filtering
  async getBusinessHubsWithLocationFilter(filters?: {
    validationStatus?: string;
    accuracyThreshold?: number;
    hasPlusCode?: boolean;
    withinRadius?: { lat: number; lng: number; radiusKm: number };
  }) {
    const hubs = await this.getAllBusinessHubs();

    if (!filters) return hubs;

    return hubs.filter(hub => {
      const location = hub.location as LocationData | null;

      if (!location) return !filters.validationStatus; // Include hubs without location if no status filter

      // Validation status filter
      if (filters.validationStatus && location.validation_status !== filters.validationStatus) {
        return false;
      }

      // Accuracy threshold filter
      if (filters.accuracyThreshold &&
          (!location.accuracy_meters || location.accuracy_meters > filters.accuracyThreshold)) {
        return false;
      }

      // Plus code filter
      if (filters.hasPlusCode !== undefined) {
        const hasPlusCode = !!location.plus_code && locationUtils.validatePlusCode(location.plus_code);
        if (filters.hasPlusCode !== hasPlusCode) return false;
      }

      // Radius filter
      if (filters.withinRadius) {
        const distance = locationUtils.calculateDistance(
          filters.withinRadius.lat,
          filters.withinRadius.lng,
          location.coordinates.lat,
          location.coordinates.lng
        );
        if (distance > filters.withinRadius.radiusKm) return false;
      }

      return true;
    });
  },

  // Location utilities for admin interface
  locationUtils,

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
    location?: LocationData;
    territory_boundaries?: TerritoryBounds;
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
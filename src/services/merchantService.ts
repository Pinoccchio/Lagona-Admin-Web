import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'restaurant' | 'grocery' | 'pharmacy' | 'retail' | 'bakery' | 'other';
  business_description: string;
  email: string;
  phone_number: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  dti_permit?: string;
  business_permit?: string;
  bir_permit?: string;
  food_license?: string;
  business_logo?: string;
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  commission_rate: number;
  minimum_order: number;
  delivery_radius: number;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  rejection_reason?: string;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  rating_count: number;
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface MerchantWithUser extends Merchant {
  users?: {
    email: string;
    full_name: string;
    phone_number?: string;
  };
}

export interface MerchantApplication {
  id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone_number: string;
  address: string;
  documents: {
    dti_permit?: string;
    business_permit?: string;
    bir_permit?: string;
    food_license?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export const merchantService = {
  async getAllMerchants(): Promise<MerchantWithUser[]> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select(`
          *,
          users!merchants_user_id_fkey (
            email,
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our interface
      const merchants = (data || []).map(merchant => ({
        id: merchant.id,
        user_id: merchant.user_id,
        business_name: merchant.business_name,
        business_type: merchant.business_type as 'restaurant' | 'grocery' | 'pharmacy' | 'retail' | 'bakery' | 'other',
        business_description: merchant.business_description || '',
        email: merchant.users?.email || '',
        phone_number: merchant.users?.phone_number || '',
        address: merchant.address,
        coordinates: merchant.coordinates,
        dti_permit: merchant.dti_permit,
        business_permit: merchant.business_permit,
        bir_permit: merchant.bir_permit || '',
        food_license: merchant.food_license || '',
        business_logo: merchant.business_logo || '',
        operating_hours: merchant.operating_hours || {},
        commission_rate: merchant.commission_rate || 12,
        minimum_order: merchant.minimum_order || 100,
        delivery_radius: merchant.delivery_radius || 5,
        status: merchant.status as 'pending' | 'active' | 'inactive' | 'suspended',
        rejection_reason: merchant.rejection_reason,
        total_orders: merchant.total_orders || 0,
        total_revenue: merchant.total_revenue || 0,
        average_rating: merchant.average_rating || 0,
        rating_count: merchant.rating_count || 0,
        created_at: merchant.created_at,
        updated_at: merchant.updated_at,
        approved_at: merchant.approved_at,
        approved_by: merchant.approved_by,
        users: merchant.users
      }))
      
      return merchants
    } catch (error) {
      console.error('Error fetching merchants:', error)
      throw error
    }
  },

  async createMerchant(params: {
    business_name: string;
    business_type: string;
    business_description: string;
    email: string;
    phone_number: string;
    address: string;
    coordinates?: { latitude: number; longitude: number };
    documents?: {
      dti_permit?: string;
      business_permit?: string;
      bir_permit?: string;
      food_license?: string;
    };
    operating_hours: any;
    commission_rate: number;
    minimum_order: number;
    delivery_radius: number;
  }) {
    const adminSupabase = createAdminClient()
    const supabase = createClient()
    
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: params.email,
        email_confirm: true,
        user_metadata: {
          full_name: `${params.business_name} Manager`,
          role: 'merchant'
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create auth user')

      const userId = authData.user.id

      try {
        // Step 2: Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: params.email,
            full_name: `${params.business_name} Manager`,
            phone_number: params.phone_number,
            role: 'merchant',
            created_at: new Date().toISOString()
          })

        if (userError) throw userError

        // Step 3: Create merchant record
        const { data: merchantRecord, error: merchantError } = await supabase
          .from('merchants')
          .insert({
            user_id: userId,
            business_name: params.business_name,
            business_type: params.business_type,
            address: params.address,
            dti_permit: params.documents?.dti_permit,
            business_permit: params.documents?.business_permit,
            status: 'pending',
            total_orders: 0,
            total_revenue: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (merchantError) throw merchantError
        return merchantRecord
      } catch (dbError) {
        // Cleanup auth user if database operations fail
        await adminSupabase.auth.admin.deleteUser(userId)
        throw dbError
      }
    } catch (error) {
      console.error('Error creating merchant:', error)
      throw error
    }
  },

  async updateMerchant(id: string, updates: {
    business_description?: string;
    phone_number?: string;
    address?: string;
    coordinates?: { latitude: number; longitude: number };
    operating_hours?: any;
    commission_rate?: number;
    minimum_order?: number;
    delivery_radius?: number;
    status?: 'pending' | 'active' | 'inactive' | 'suspended';
  }) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('merchants')
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
      console.error('Error updating merchant:', error)
      throw error
    }
  },

  async approveMerchant(id: string, approvedBy: string) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('merchants')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error approving merchant:', error)
      throw error
    }
  },

  async rejectMerchant(id: string, reason: string, rejectedBy: string) {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('merchants')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error rejecting merchant:', error)
      throw error
    }
  },

  async deleteMerchant(id: string) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      const { data: merchant, error: fetchError } = await supabase
        .from('merchants')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!merchant) throw new Error('Merchant not found')

      // Delete merchant record
      const { error: deleteError } = await supabase
        .from('merchants')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Delete user record
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', merchant.user_id)

      if (userDeleteError) throw userDeleteError

      // Delete auth user
      await adminSupabase.auth.admin.deleteUser(merchant.user_id)

      return { success: true }
    } catch (error) {
      console.error('Error deleting merchant:', error)
      throw error
    }
  },

  async getMerchantStatistics() {
    const merchants = await this.getAllMerchants()
    
    const totalMerchants = merchants.length
    const activeMerchants = merchants.filter(m => m.status === 'active').length
    const pendingMerchants = merchants.filter(m => m.status === 'pending').length
    const suspendedMerchants = merchants.filter(m => m.status === 'suspended').length
    
    const totalRevenue = merchants.reduce((sum, m) => sum + m.total_revenue, 0)
    const totalOrders = merchants.reduce((sum, m) => sum + m.total_orders, 0)
    const averageRating = merchants.length > 0 
      ? merchants.reduce((sum, m) => sum + m.average_rating, 0) / merchants.length 
      : 0

    // Business type distribution
    const businessTypes = merchants.reduce((acc, merchant) => {
      acc[merchant.business_type] = (acc[merchant.business_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalMerchants,
      activeMerchants,
      pendingMerchants,
      suspendedMerchants,
      totalRevenue,
      totalOrders,
      averageRating: Math.round(averageRating * 10) / 10,
      businessTypes
    }
  },

  async getMerchantApplications(): Promise<MerchantApplication[]> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select(`
          id,
          business_name,
          business_type,
          address,
          dti_permit,
          business_permit,
          status,
          created_at,
          users!merchants_user_id_fkey (
            email,
            phone_number
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match MerchantApplication interface
      const applications = (data || []).map(merchant => ({
        id: merchant.id,
        business_name: merchant.business_name,
        business_type: merchant.business_type,
        email: merchant.users?.email || '',
        phone_number: merchant.users?.phone_number || '',
        address: merchant.address,
        documents: {
          dti_permit: merchant.dti_permit,
          business_permit: merchant.business_permit
        },
        status: merchant.status as 'pending' | 'approved' | 'rejected',
        submitted_at: merchant.created_at
      }))
      
      return applications
    } catch (error) {
      console.error('Error fetching merchant applications:', error)
      throw error
    }
  }
}
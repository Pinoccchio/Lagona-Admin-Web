import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Shareholder {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  ownership_percentage: number;
  total_dividends: number;
  pending_dividends: number;
  last_dividend_date?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface ShareholderWithUser extends Shareholder {
  users?: {
    email: string;
    full_name: string;
    phone_number?: string;
  };
}

export interface DividendDistribution {
  id: string;
  shareholder_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at: string;
}

export const shareholderService = {
  async getAllShareholders(): Promise<ShareholderWithUser[]> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('shareholders')
        .select(`
          *,
          users!shareholders_user_id_fkey (
            email,
            full_name,
            phone_number
          )
        `)
        .order('ownership_percentage', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our interface
      const shareholders = (data || []).map(shareholder => ({
        id: shareholder.id,
        user_id: shareholder.user_id,
        full_name: shareholder.users?.full_name || '',
        email: shareholder.users?.email || '',
        phone_number: shareholder.users?.phone_number,
        ownership_percentage: shareholder.ownership_percentage,
        total_dividends: shareholder.total_dividends || 0,
        pending_dividends: shareholder.pending_dividends || 0,
        last_dividend_date: shareholder.last_dividend_date,
        status: shareholder.status as 'active' | 'inactive',
        created_at: shareholder.created_at,
        updated_at: shareholder.updated_at,
        users: shareholder.users
      }))
      
      return shareholders
    } catch (error) {
      console.error('Error fetching shareholders:', error)
      throw error
    }
  },

  async createShareholder(params: {
    full_name: string;
    email: string;
    phone_number?: string;
    ownership_percentage: number;
    initial_investment?: number;
  }) {
    const adminSupabase = createAdminClient()
    const supabase = createClient()
    
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: params.email,
        email_confirm: true,
        user_metadata: {
          full_name: params.full_name,
          role: 'shareholder'
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
            full_name: params.full_name,
            phone_number: params.phone_number,
            role: 'shareholder',
            created_at: new Date().toISOString()
          })

        if (userError) throw userError

        // Step 3: Create shareholder record
        const { data: shareholderRecord, error: shareholderError } = await supabase
          .from('shareholders')
          .insert({
            user_id: userId,
            ownership_percentage: params.ownership_percentage,
            initial_investment: params.initial_investment || 0,
            total_dividends: 0,
            pending_dividends: 0,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (shareholderError) throw shareholderError
        return shareholderRecord
      } catch (dbError) {
        // Cleanup auth user if database operations fail
        await adminSupabase.auth.admin.deleteUser(userId)
        throw dbError
      }
    } catch (error) {
      console.error('Error creating shareholder:', error)
      throw error
    }
  },

  async updateShareholder(id: string, updates: {
    ownership_percentage?: number;
    status?: 'active' | 'inactive';
    phone_number?: string;
  }) {
    const supabase = createClient()
    
    try {
      // First get the shareholder to find the user_id
      const { data: shareholder, error: fetchError } = await supabase
        .from('shareholders')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching shareholder:', fetchError)
        throw fetchError
      }

      // Separate updates for shareholders table and users table
      const shareholderUpdates: any = {
        updated_at: new Date().toISOString()
      }
      
      if (updates.ownership_percentage !== undefined) {
        shareholderUpdates.ownership_percentage = updates.ownership_percentage
      }
      if (updates.status !== undefined) {
        shareholderUpdates.status = updates.status
      }

      // Update shareholders table
      const { data: shareholderData, error: shareholderError } = await supabase
        .from('shareholders')
        .update(shareholderUpdates)
        .eq('id', id)
        .select()
        .single()

      if (shareholderError) {
        console.error('Error updating shareholder table:', shareholderError)
        throw shareholderError
      }

      // Update users table if phone_number is provided
      if (updates.phone_number !== undefined) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            phone_number: updates.phone_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', shareholder.user_id)

        if (userError) {
          console.error('Error updating user phone number:', userError)
          throw userError
        }
      }

      return shareholderData
    } catch (error) {
      console.error('Error updating shareholder:', error)
      throw error
    }
  },

  async deleteShareholder(id: string) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
      // Get shareholder details first
      const { data: shareholder, error: fetchError } = await supabase
        .from('shareholders')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!shareholder) throw new Error('Shareholder not found')

      // Delete shareholder record
      const { error: deleteError } = await supabase
        .from('shareholders')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Delete user record
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', shareholder.user_id)

      if (userDeleteError) throw userDeleteError

      // Delete auth user
      await adminSupabase.auth.admin.deleteUser(shareholder.user_id)

      return { success: true }
    } catch (error) {
      console.error('Error deleting shareholder:', error)
      throw error
    }
  },

  async getShareholderStatistics() {
    const shareholders = await this.getAllShareholders()
    
    const totalOwnership = shareholders.reduce((sum, s) => sum + s.ownership_percentage, 0)
    const totalDividendsPaid = shareholders.reduce((sum, s) => sum + s.total_dividends, 0)
    const totalPendingDividends = shareholders.reduce((sum, s) => sum + s.pending_dividends, 0)
    const activeCount = shareholders.filter(s => s.status === 'active').length
    
    return {
      totalShareholders: shareholders.length,
      activeShareholders: activeCount,
      totalOwnership,
      totalDividendsPaid,
      totalPendingDividends,
      unallocatedOwnership: 100 - totalOwnership
    }
  },

  async distributeDividends(totalAmount: number, period: { start: string; end: string }) {
    const supabase = createClient()
    const shareholders = await this.getAllShareholders()
    
    try {
      const distributions = shareholders
        .filter(s => s.status === 'active')
        .map(shareholder => ({
          shareholder_id: shareholder.id,
          amount: (totalAmount * shareholder.ownership_percentage) / 100,
          period_start: period.start,
          period_end: period.end,
          status: 'pending' as const,
          created_at: new Date().toISOString()
        }))
      
      // Create dividend distribution records
      const { data, error } = await supabase
        .from('dividend_distributions')
        .insert(distributions)
        .select()
      
      if (error) throw error
      
      // Update shareholders' pending dividends
      for (const distribution of distributions) {
        await supabase
          .from('shareholders')
          .update({
            pending_dividends: supabase.raw(`pending_dividends + ${distribution.amount}`),
            updated_at: new Date().toISOString()
          })
          .eq('id', distribution.shareholder_id)
      }
      
      return data || distributions
    } catch (error) {
      console.error('Error distributing dividends:', error)
      throw error
    }
  }
}
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export const userService = {
  async getAllUsers() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getUserById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getUsersByRole(role: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createUser(user: UserInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: UserUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUser(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async getUserStatistics() {
    const supabase = createClient()
    
    const { data: users, error } = await supabase
      .from('users')
      .select('role')

    if (error) throw error

    const roleCount: Record<string, number> = {}
    users?.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1
    })

    return {
      totalUsers: users?.length || 0,
      roleDistribution: roleCount,
      admins: roleCount['admin'] || 0,
      businessHubs: roleCount['business_hub'] || 0,
      loadingStations: roleCount['loading_station'] || 0,
      riders: roleCount['rider'] || 0,
      merchants: roleCount['merchant'] || 0,
      customers: roleCount['customer'] || 0,
      shareholders: roleCount['shareholder'] || 0
    }
  },

  async searchUsers(searchTerm: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
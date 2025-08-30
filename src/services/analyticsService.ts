import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export const analyticsService = {
  async getDashboardStatistics() {
    const supabase = createClient()
    
    const [
      { data: users },
      { data: businessHubs },
      { data: loadingStations },
      { data: riders },
      { data: merchants },
      { data: orders },
      { data: commissions }
    ] = await Promise.all([
      supabase.from('users').select('id, role'),
      supabase.from('business_hubs').select('id, status, total_revenue'),
      supabase.from('loading_stations').select('id, status, total_revenue'),
      supabase.from('riders').select('id, status, total_earnings'),
      supabase.from('merchants').select('id, status, total_revenue'),
      supabase.from('orders').select('id, status, total_amount, delivery_fee, created_at'),
      supabase.from('commissions').select('*')
    ])

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    const monthlyOrders = orders?.filter(o => 
      new Date(o.created_at!) >= startOfMonth
    ) || []

    const weeklyOrders = orders?.filter(o => 
      new Date(o.created_at!) >= startOfWeek
    ) || []

    const totalRevenue = orders?.reduce((sum, o) => 
      sum + (o.status === 'delivered' ? o.total_amount : 0), 0
    ) || 0

    const monthlyRevenue = monthlyOrders.reduce((sum, o) => 
      sum + (o.status === 'delivered' ? o.total_amount : 0), 0
    )

    const totalCommissions = commissions?.reduce((sum, c) => 
      sum + (c.business_hub_amount || 0) + (c.loading_station_amount || 0) + 
      (c.rider_amount || 0) + (c.platform_amount || 0), 0
    ) || 0

    return {
      users: {
        total: users?.length || 0,
        customers: users?.filter(u => u.role === 'customer').length || 0,
        merchants: users?.filter(u => u.role === 'merchant').length || 0,
        riders: users?.filter(u => u.role === 'rider').length || 0
      },
      businessHubs: {
        total: businessHubs?.length || 0,
        active: businessHubs?.filter(h => h.status === 'active').length || 0,
        totalRevenue: businessHubs?.reduce((sum, h) => sum + (h.total_revenue || 0), 0) || 0
      },
      loadingStations: {
        total: loadingStations?.length || 0,
        active: loadingStations?.filter(s => s.status === 'active').length || 0,
        totalRevenue: loadingStations?.reduce((sum, s) => sum + (s.total_revenue || 0), 0) || 0
      },
      riders: {
        total: riders?.length || 0,
        active: riders?.filter(r => r.status === 'active').length || 0,
        onDelivery: riders?.filter(r => r.status === 'on_delivery').length || 0,
        totalEarnings: riders?.reduce((sum, r) => sum + (r.total_earnings || 0), 0) || 0
      },
      orders: {
        total: orders?.length || 0,
        delivered: orders?.filter(o => o.status === 'delivered').length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        monthlyCount: monthlyOrders.length,
        weeklyCount: weeklyOrders.length
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        commissions: totalCommissions,
        platformFees: commissions?.reduce((sum, c) => sum + (c.platform_amount || 0), 0) || 0
      }
    }
  },

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const supabase = createClient()
    
    const now = new Date()
    let startDate: Date
    
    switch(period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 84))
        break
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 12))
        break
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total_amount, delivery_fee, status')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'delivered')
      .order('created_at', { ascending: true })

    if (error) throw error

    const revenueByPeriod: Record<string, number> = {}
    
    orders?.forEach(order => {
      const date = new Date(order.created_at!)
      let key: string
      
      switch(period) {
        case 'daily':
          key = date.toISOString().split('T')[0]
          break
        case 'weekly':
          const week = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
          key = `Week ${week + 1}`
          break
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }
      
      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + order.total_amount
    })

    return revenueByPeriod
  },

  async getCommissionDistribution() {
    const supabase = createClient()
    
    const { data: commissions, error } = await supabase
      .from('commissions')
      .select('*')

    if (error) throw error

    const totalBusinessHub = commissions?.reduce((sum, c) => sum + (c.business_hub_amount || 0), 0) || 0
    const totalLoadingStation = commissions?.reduce((sum, c) => sum + (c.loading_station_amount || 0), 0) || 0
    const totalRider = commissions?.reduce((sum, c) => sum + (c.rider_amount || 0), 0) || 0
    const totalPlatform = commissions?.reduce((sum, c) => sum + (c.platform_amount || 0), 0) || 0

    const total = totalBusinessHub + totalLoadingStation + totalRider + totalPlatform

    return {
      total,
      distribution: {
        businessHub: {
          amount: totalBusinessHub,
          percentage: total > 0 ? (totalBusinessHub / total) * 100 : 0
        },
        loadingStation: {
          amount: totalLoadingStation,
          percentage: total > 0 ? (totalLoadingStation / total) * 100 : 0
        },
        rider: {
          amount: totalRider,
          percentage: total > 0 ? (totalRider / total) * 100 : 0
        },
        platform: {
          amount: totalPlatform,
          percentage: total > 0 ? (totalPlatform / total) * 100 : 0
        }
      }
    }
  }
}
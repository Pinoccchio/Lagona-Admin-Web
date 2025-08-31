import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export interface AuditLog {
  id: string
  admin_id: string
  admin_email: string
  admin_name?: string
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'TOP_UP' | 'CONFIG_CHANGE'
  entity_type: 'business_hub' | 'loading_station' | 'rider' | 'merchant' | 'user' | 'system_config' | 'top_up'
  entity_id?: string
  entity_name?: string
  old_values?: any
  new_values?: any
  changes_summary?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AuditFilters {
  entity_type?: string
  entity_id?: string
  admin_id?: string
  action_type?: string
  start_date?: string
  end_date?: string
  limit?: number
}

export const auditService = {
  async getAuditLogs(filters: AuditFilters = {}) {
    const supabase = createClient()
    let query = supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type)
    }
    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id)
    }
    if (filters.admin_id) {
      query = query.eq('admin_id', filters.admin_id)
    }
    if (filters.action_type) {
      query = query.eq('action_type', filters.action_type)
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data as AuditLog[]
  },

  async getEntityAuditHistory(entityType: string, entityId: string) {
    return this.getAuditLogs({
      entity_type: entityType,
      entity_id: entityId,
      limit: 50
    })
  },

  async getRecentAdminActions(adminId?: string, limit: number = 20) {
    const filters: AuditFilters = { limit }
    if (adminId) {
      filters.admin_id = adminId
    }
    return this.getAuditLogs(filters)
  },

  async getSystemConfigChanges(limit: number = 50) {
    return this.getAuditLogs({
      entity_type: 'system_config',
      limit
    })
  },

  formatChanges(oldValues: any, newValues: any): string[] {
    const changes: string[] = []
    
    if (!oldValues || !newValues) return changes

    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {})
    ])

    allKeys.forEach(key => {
      // Skip system fields
      if (['id', 'created_at', 'updated_at', 'user_id', 'last_modified_by', 'created_by'].includes(key)) return

      const oldVal = oldValues?.[key]
      const newVal = newValues?.[key]

      if (oldVal !== newVal) {
        if (key === 'status') {
          changes.push(`Status changed from ${oldVal || 'none'} to ${newVal}`)
        } else if (key === 'commission_rate') {
          changes.push(`Commission rate changed from ${oldVal}% to ${newVal}%`)
        } else if (key === 'current_balance') {
          changes.push(`Balance changed from ₱${oldVal || 0} to ₱${newVal}`)
        } else if (key === 'uses_system_commission_rate') {
          changes.push(newVal ? 'Switched to system commission rate' : 'Switched to custom commission rate')
        } else if (typeof newVal === 'object') {
          changes.push(`${key} configuration updated`)
        } else {
          changes.push(`${key}: ${oldVal || 'empty'} → ${newVal}`)
        }
      }
    })

    return changes
  },

  getActionTypeColor(actionType: string): string {
    switch (actionType) {
      case 'CREATE': return 'text-green-600 bg-green-100'
      case 'UPDATE': return 'text-blue-600 bg-blue-100'
      case 'DELETE': return 'text-red-600 bg-red-100'
      case 'APPROVE': return 'text-emerald-600 bg-emerald-100'
      case 'REJECT': return 'text-orange-600 bg-orange-100'
      case 'TOP_UP': return 'text-purple-600 bg-purple-100'
      case 'CONFIG_CHANGE': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  },

  getEntityTypeLabel(entityType: string): string {
    switch (entityType) {
      case 'business_hub': return 'Business Hub'
      case 'loading_station': return 'Loading Station'
      case 'rider': return 'Rider'
      case 'merchant': return 'Merchant'
      case 'user': return 'User'
      case 'system_config': return 'System Config'
      case 'top_up': return 'Top-up'
      default: return entityType
    }
  }
}
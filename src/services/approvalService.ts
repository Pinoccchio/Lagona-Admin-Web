import { createAdminClient } from '@/lib/supabase/admin'
import { auditService } from './auditService'

export type EntityType = 'rider' | 'merchant' | 'business_hub' | 'loading_station' | 'shareholder'

export interface PendingCounts {
  riders: number
  merchants: number
  businessHubs: number
  loadingStations: number
  shareholders: number
  total: number
}

export interface ApprovalAction {
  entityType: EntityType
  entityId: string
  entityName: string
  action: 'approve' | 'reject'
  reason?: string
  adminId: string
  adminEmail: string
}

export interface PendingItem {
  id: string
  type: EntityType
  name: string
  email?: string
  submittedAt: string
  details?: Record<string, any>
}

export const approvalService = {
  /**
   * Get counts of pending items across all entity types
   */
  async getPendingCounts(): Promise<PendingCounts> {
    try {
      const supabase = createAdminClient()

      const [
        ridersCount,
        merchantsCount,
        businessHubsCount,
        loadingStationsCount,
        shareholdersCount
      ] = await Promise.allSettled([
        supabase.from('riders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('merchants').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('business_hubs').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('loading_stations').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'shareholder').eq('status', 'pending')
      ])

      const riders = ridersCount.status === 'fulfilled' ? (ridersCount.value.count || 0) : 0
      const merchants = merchantsCount.status === 'fulfilled' ? (merchantsCount.value.count || 0) : 0
      const businessHubs = businessHubsCount.status === 'fulfilled' ? (businessHubsCount.value.count || 0) : 0
      const loadingStations = loadingStationsCount.status === 'fulfilled' ? (loadingStationsCount.value.count || 0) : 0
      const shareholders = shareholdersCount.status === 'fulfilled' ? (shareholdersCount.value.count || 0) : 0

      const total = riders + merchants + businessHubs + loadingStations + shareholders

      return {
        riders,
        merchants,
        businessHubs,
        loadingStations,
        shareholders,
        total
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error)
      return {
        riders: 0,
        merchants: 0,
        businessHubs: 0,
        loadingStations: 0,
        shareholders: 0,
        total: 0
      }
    }
  },

  /**
   * Get all pending items across entity types
   */
  async getAllPendingItems(): Promise<PendingItem[]> {
    try {
      const supabase = createAdminClient()
      const pendingItems: PendingItem[] = []

      // Fetch pending riders
      const { data: pendingRiders } = await supabase
        .from('riders')
        .select(`
          id,
          full_name,
          email,
          created_at,
          users!inner(email, full_name)
        `)
        .eq('status', 'pending')

      if (pendingRiders) {
        pendingItems.push(...pendingRiders.map(rider => ({
          id: rider.id,
          type: 'rider' as EntityType,
          name: rider.full_name,
          email: rider.email,
          submittedAt: rider.created_at,
          details: rider
        })))
      }

      // Fetch pending merchants
      const { data: pendingMerchants } = await supabase
        .from('merchants')
        .select(`
          id,
          business_name,
          created_at,
          users!inner(email, full_name)
        `)
        .eq('status', 'pending')

      if (pendingMerchants) {
        pendingItems.push(...pendingMerchants.map(merchant => ({
          id: merchant.id,
          type: 'merchant' as EntityType,
          name: merchant.business_name,
          email: merchant.users?.email,
          submittedAt: merchant.created_at,
          details: merchant
        })))
      }

      // Fetch pending business hubs
      const { data: pendingBusinessHubs } = await supabase
        .from('business_hubs')
        .select(`
          id,
          name,
          created_at,
          users!inner(email, full_name)
        `)
        .eq('status', 'pending')

      if (pendingBusinessHubs) {
        pendingItems.push(...pendingBusinessHubs.map(hub => ({
          id: hub.id,
          type: 'business_hub' as EntityType,
          name: hub.name,
          email: hub.users?.email,
          submittedAt: hub.created_at,
          details: hub
        })))
      }

      // Sort by submission date (newest first)
      return pendingItems.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    } catch (error) {
      console.error('Error fetching pending items:', error)
      return []
    }
  },

  /**
   * Approve an entity
   */
  async approveEntity(action: ApprovalAction): Promise<void> {
    try {
      const supabase = createAdminClient()
      const { entityType, entityId, adminId, adminEmail, entityName } = action

      // Get table name based on entity type
      const tableName = this.getTableName(entityType)

      // Update the entity status
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', entityId)

      if (updateError) {
        throw new Error(`Failed to approve ${entityType}: ${updateError.message}`)
      }

      // Log the approval action
      await auditService.logAction({
        adminId,
        adminEmail,
        actionType: 'APPROVE',
        entityType: entityType.toUpperCase().replace('_', '_') as any,
        entityId,
        entityName,
        newValues: { status: 'active', approved_at: new Date().toISOString() },
        changesSummary: `Approved ${entityType}: ${entityName}`
      })

    } catch (error) {
      console.error('Error approving entity:', error)
      throw error
    }
  },

  /**
   * Reject an entity
   */
  async rejectEntity(action: ApprovalAction): Promise<void> {
    try {
      const supabase = createAdminClient()
      const { entityType, entityId, reason, adminId, adminEmail, entityName } = action

      // Get table name based on entity type
      const tableName = this.getTableName(entityType)

      // Update the entity status
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          rejected_by: adminId
        })
        .eq('id', entityId)

      if (updateError) {
        throw new Error(`Failed to reject ${entityType}: ${updateError.message}`)
      }

      // Log the rejection action
      await auditService.logAction({
        adminId,
        adminEmail,
        actionType: 'REJECT',
        entityType: entityType.toUpperCase().replace('_', '_') as any,
        entityId,
        entityName,
        newValues: { 
          status: 'rejected', 
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        },
        changesSummary: `Rejected ${entityType}: ${entityName}. Reason: ${reason}`
      })

    } catch (error) {
      console.error('Error rejecting entity:', error)
      throw error
    }
  },

  /**
   * Bulk approve multiple entities
   */
  async bulkApprove(actions: ApprovalAction[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const action of actions) {
      try {
        await this.approveEntity(action)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to approve ${action.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return results
  },

  /**
   * Bulk reject multiple entities
   */
  async bulkReject(actions: ApprovalAction[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const action of actions) {
      try {
        await this.rejectEntity(action)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to reject ${action.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return results
  },

  /**
   * Get table name from entity type
   */
  getTableName(entityType: EntityType): string {
    switch (entityType) {
      case 'rider':
        return 'riders'
      case 'merchant':
        return 'merchants'
      case 'business_hub':
        return 'business_hubs'
      case 'loading_station':
        return 'loading_stations'
      case 'shareholder':
        return 'users' // Shareholders are stored in users table with role='shareholder'
      default:
        throw new Error(`Unknown entity type: ${entityType}`)
    }
  }
}
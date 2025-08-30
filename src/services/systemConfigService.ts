import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type SystemConfig = Database['public']['Tables']['system_config']['Row']
type SystemConfigInsert = Database['public']['Tables']['system_config']['Insert']
type SystemConfigUpdate = Database['public']['Tables']['system_config']['Update']

export interface CommissionRates {
  businessHub: number
  loadingStation: number
  rider: number
  platform: number
}

export interface DeliveryPricing {
  baseRate: number
  perKmRate: number
}

export interface TopUpBonuses {
  businessHubBonus: number
  loadingStationBonus: number
}

export interface SystemSettings {
  maintenanceMode: boolean
  newRegistrations: boolean
  autoApprovals: boolean
  notificationsEnabled: boolean
}

export const systemConfigService = {
  async getAllConfigs() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .order('config_key', { ascending: true })

    if (error) throw error
    return data
  },

  async getConfigByKey(key: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', key)
      .single()

    if (error) throw error
    return data
  },

  async getConfigsByType(type: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_type', type)
      .order('config_key', { ascending: true })

    if (error) throw error
    return data
  },

  async updateConfig(key: string, value: any, updatedBy?: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('system_config')
      .update({
        config_value: value,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', key)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createConfig(config: SystemConfigInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('system_config')
      .insert(config)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async upsertConfig(key: string, value: any, type: string, description?: string, updatedBy?: string) {
    const supabase = createClient()
    
    // First try to update existing record
    const { data: updateData, error: updateError } = await supabase
      .from('system_config')
      .update({
        config_value: value,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', key)
      .select()
      .single()

    // If record doesn't exist, create it
    if (updateError && updateError.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabase
        .from('system_config')
        .insert({
          config_key: key,
          config_value: value,
          config_type: type,
          description: description,
          updated_by: updatedBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
      return insertData
    } else if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return updateData
  },

  // Specific helper methods for common configurations
  async getCommissionRates(): Promise<CommissionRates> {
    try {
      const data = await this.getConfigByKey('commission_rates')
      if (!data) {
        // Return default values if config doesn't exist
        return {
          businessHub: 50,
          loadingStation: 20,
          rider: 18,
          platform: 12
        }
      }
      return data.config_value as unknown as CommissionRates
    } catch (error) {
      console.warn('Failed to get commission rates from config, using defaults:', error)
      return {
        businessHub: 50,
        loadingStation: 20,
        rider: 18,
        platform: 12
      }
    }
  },

  async updateCommissionRates(rates: CommissionRates, updatedBy?: string) {
    return this.upsertConfig(
      'commission_rates',
      rates,
      'commission',
      'Commission distribution percentages for all stakeholders',
      updatedBy
    )
  },

  async getDeliveryPricing(): Promise<DeliveryPricing> {
    try {
      const data = await this.getConfigByKey('delivery_pricing')
      if (!data) {
        return {
          baseRate: 65,
          perKmRate: 10
        }
      }
      return data.config_value as unknown as DeliveryPricing
    } catch (error) {
      console.warn('Failed to get delivery pricing from config, using defaults:', error)
      return {
        baseRate: 65,
        perKmRate: 10
      }
    }
  },

  async updateDeliveryPricing(pricing: DeliveryPricing, updatedBy?: string) {
    return this.upsertConfig(
      'delivery_pricing',
      pricing,
      'pricing',
      'Delivery fee calculation parameters',
      updatedBy
    )
  },

  async getTopUpBonuses(): Promise<TopUpBonuses> {
    try {
      const data = await this.getConfigByKey('topup_bonuses')
      if (!data) {
        return {
          businessHubBonus: 50,
          loadingStationBonus: 25
        }
      }
      return data.config_value as unknown as TopUpBonuses
    } catch (error) {
      console.warn('Failed to get topup bonuses from config, using defaults:', error)
      return {
        businessHubBonus: 50,
        loadingStationBonus: 25
      }
    }
  },

  async updateTopUpBonuses(bonuses: TopUpBonuses, updatedBy?: string) {
    return this.upsertConfig(
      'topup_bonuses',
      bonuses,
      'bonus',
      'Top-up bonus percentages for different stakeholder types',
      updatedBy
    )
  },

  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const data = await this.getConfigByKey('system_settings')
      if (!data) {
        return {
          maintenanceMode: false,
          newRegistrations: true,
          autoApprovals: false,
          notificationsEnabled: true
        }
      }
      return data.config_value as unknown as SystemSettings
    } catch (error) {
      console.warn('Failed to get system settings from config, using defaults:', error)
      return {
        maintenanceMode: false,
        newRegistrations: true,
        autoApprovals: false,
        notificationsEnabled: true
      }
    }
  },

  async updateSystemSettings(settings: SystemSettings, updatedBy?: string) {
    return this.upsertConfig(
      'system_settings',
      settings,
      'system',
      'General system operational settings',
      updatedBy
    )
  },

  async initializeDefaultConfigs(updatedBy?: string) {
    const defaultConfigs = [
      {
        key: 'commission_rates',
        value: { businessHub: 50, loadingStation: 20, rider: 18, platform: 12 },
        type: 'commission',
        description: 'Commission distribution percentages for all stakeholders'
      },
      {
        key: 'delivery_pricing',
        value: { baseRate: 65, perKmRate: 10 },
        type: 'pricing',
        description: 'Delivery fee calculation parameters'
      },
      {
        key: 'topup_bonuses',
        value: { businessHubBonus: 50, loadingStationBonus: 25 },
        type: 'bonus',
        description: 'Top-up bonus percentages for different stakeholder types'
      },
      {
        key: 'system_settings',
        value: { maintenanceMode: false, newRegistrations: true, autoApprovals: false, notificationsEnabled: true },
        type: 'system',
        description: 'General system operational settings'
      }
    ]

    const results = []
    for (const config of defaultConfigs) {
      try {
        const result = await this.upsertConfig(
          config.key,
          config.value,
          config.type,
          config.description,
          updatedBy
        )
        results.push(result)
      } catch (error) {
        console.error(`Failed to initialize config ${config.key}:`, error)
        throw error
      }
    }

    return results
  }
}
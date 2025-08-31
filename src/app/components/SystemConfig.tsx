'use client';

import { useState, useEffect } from 'react';
import { systemConfigService, type CommissionRates, type DeliveryPricing, type TopUpBonuses, type SystemSettings } from '@/services/systemConfigService';
import { businessHubService } from '@/services/businessHubService';
import { loadingStationService } from '@/services/loadingStationService';
import { auditService } from '@/services/auditService';
import AuditHistory from './AuditHistory';

export default function SystemConfig() {
  const [commissionRates, setCommissionRates] = useState<CommissionRates>({
    businessHub: 50,
    loadingStation: 20,
    rider: 18,
    platform: 12
  });

  const [deliveryPricing, setDeliveryPricing] = useState<DeliveryPricing>({
    baseRate: 65,
    perKmRate: 10
  });

  const [topUpBonuses, setTopUpBonuses] = useState<TopUpBonuses>({
    businessHubBonus: 50,
    loadingStationBonus: 25
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    newRegistrations: true,
    autoApprovals: false,
    notificationsEnabled: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPropagationWarning, setShowPropagationWarning] = useState(false);
  const [affectedEntities, setAffectedEntities] = useState<{ hubs: number; stations: number }>({ hubs: 0, stations: 0 });
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rates, pricing, bonuses, settings] = await Promise.all([
        systemConfigService.getCommissionRates(),
        systemConfigService.getDeliveryPricing(),
        systemConfigService.getTopUpBonuses(),
        systemConfigService.getSystemSettings()
      ]);

      setCommissionRates(rates);
      setDeliveryPricing(pricing);
      setTopUpBonuses(bonuses);
      setSystemSettings(settings);
    } catch (err) {
      console.error('Error loading configurations:', err);
      setError('Failed to load system configurations');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const checkAffectedEntities = async () => {
    try {
      // Get all business hubs and loading stations that use system rates
      const hubs = await businessHubService.getAllBusinessHubs();
      const stations = await loadingStationService.getAllLoadingStations();
      
      const affectedHubs = hubs.filter((h: any) => h.uses_system_commission_rate !== false).length;
      const affectedStations = stations.filter((s: any) => s.uses_system_commission_rate !== false).length;
      
      setAffectedEntities({ hubs: affectedHubs, stations: affectedStations });
      
      if (affectedHubs > 0 || affectedStations > 0) {
        setShowPropagationWarning(true);
      }
      
      return { hubs: affectedHubs, stations: affectedStations };
    } catch (error) {
      console.error('Error checking affected entities:', error);
      return { hubs: 0, stations: 0 };
    }
  };

  const handleCommissionSave = async () => {
    try {
      setSaveLoading('commission');
      setError(null);
      
      // Validate commission rates
      const total = commissionRates.businessHub + commissionRates.loadingStation + commissionRates.rider + commissionRates.platform;
      if (Math.abs(total - 100) > 0.01) {
        throw new Error(`Commission rates must total 100%. Current total: ${total}%`);
      }
      
      await systemConfigService.updateCommissionRates(commissionRates);
      showSuccessMessage('Commission rates updated successfully!');
    } catch (err) {
      console.error('Error saving commission rates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save commission rates';
      setError(errorMessage);
    } finally {
      setSaveLoading(null);
    }
  };

  const handleDeliveryPricingSave = async () => {
    try {
      setSaveLoading('pricing');
      setError(null);
      
      // Validate pricing values
      if (deliveryPricing.baseRate <= 0 || deliveryPricing.perKmRate <= 0) {
        throw new Error('Pricing values must be greater than 0');
      }
      
      await systemConfigService.updateDeliveryPricing(deliveryPricing);
      showSuccessMessage('Delivery pricing updated successfully!');
    } catch (err) {
      console.error('Error saving delivery pricing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save delivery pricing';
      setError(errorMessage);
    } finally {
      setSaveLoading(null);
    }
  };

  const handleBonusSave = async () => {
    try {
      setSaveLoading('bonus');
      setError(null);
      
      // Validate bonus values
      if (topUpBonuses.businessHubBonus < 0 || topUpBonuses.loadingStationBonus < 0) {
        throw new Error('Bonus values cannot be negative');
      }
      if (topUpBonuses.businessHubBonus > 100 || topUpBonuses.loadingStationBonus > 100) {
        throw new Error('Bonus values cannot exceed 100%');
      }
      
      await systemConfigService.updateTopUpBonuses(topUpBonuses);
      showSuccessMessage('Bonus settings updated successfully!');
    } catch (err) {
      console.error('Error saving bonus settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save bonus settings';
      setError(errorMessage);
    } finally {
      setSaveLoading(null);
    }
  };

  const handleSystemSettingsSave = async () => {
    try {
      setSaveLoading('system');
      setError(null);
      await systemConfigService.updateSystemSettings(systemSettings);
      showSuccessMessage('System settings updated successfully!');
    } catch (err) {
      console.error('Error saving system settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save system settings';
      setError(errorMessage);
    } finally {
      setSaveLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-deep-black">System Configuration</h1>
          <p className="text-gray-600 mt-1">Configure commission rates, pricing, and platform parameters</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading system configurations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-black">System Configuration</h1>
        <p className="text-gray-600 mt-1">Configure commission rates, pricing, and platform parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Rates */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-xl font-semibold text-deep-black mb-6">Commission Distribution</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hub Commission (%)
              </label>
              <input
                type="number"
                value={commissionRates.businessHub}
                onChange={(e) => setCommissionRates({
                  ...commissionRates,
                  businessHub: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loading Station Commission (%)
              </label>
              <input
                type="number"
                value={commissionRates.loadingStation}
                onChange={(e) => setCommissionRates({
                  ...commissionRates,
                  loadingStation: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rider Commission (%)
              </label>
              <input
                type="number"
                value={commissionRates.rider}
                onChange={(e) => setCommissionRates({
                  ...commissionRates,
                  rider: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Share (%)
              </label>
              <input
                type="number"
                value={commissionRates.platform}
                onChange={(e) => setCommissionRates({
                  ...commissionRates,
                  platform: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span>Total:</span>
                <span className={`font-semibold ${
                  commissionRates.businessHub + commissionRates.loadingStation + 
                  commissionRates.rider + commissionRates.platform === 100 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {commissionRates.businessHub + commissionRates.loadingStation + 
                   commissionRates.rider + commissionRates.platform}%
                </span>
              </div>
            </div>

            <button
              onClick={handleCommissionSave}
              disabled={saveLoading === 'commission'}
              className={`w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow ${
                saveLoading === 'commission' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saveLoading === 'commission' ? 'Saving...' : 'Save Commission Rates'}
            </button>
          </div>
        </div>

        {/* Delivery Pricing */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-xl font-semibold text-deep-black mb-6">Delivery Pricing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Delivery Rate (₱)
              </label>
              <input
                type="number"
                value={deliveryPricing.baseRate}
                onChange={(e) => setDeliveryPricing({
                  ...deliveryPricing,
                  baseRate: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">Flat rate charged for all deliveries</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Kilometer Rate (₱)
              </label>
              <input
                type="number"
                value={deliveryPricing.perKmRate}
                onChange={(e) => setDeliveryPricing({
                  ...deliveryPricing,
                  perKmRate: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">Additional charge per kilometer</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Pricing Examples</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>1km delivery: ₱{deliveryPricing.baseRate + deliveryPricing.perKmRate}</div>
                <div>3km delivery: ₱{deliveryPricing.baseRate + (deliveryPricing.perKmRate * 3)}</div>
                <div>5km delivery: ₱{deliveryPricing.baseRate + (deliveryPricing.perKmRate * 5)}</div>
              </div>
            </div>

            <button
              onClick={handleDeliveryPricingSave}
              disabled={saveLoading === 'pricing'}
              className={`w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow ${
                saveLoading === 'pricing' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saveLoading === 'pricing' ? 'Saving...' : 'Save Delivery Pricing'}
            </button>
          </div>
        </div>

        {/* Top-up Bonuses */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-xl font-semibold text-deep-black mb-6">Top-up Bonus System</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hub Bonus (%)
              </label>
              <input
                type="number"
                value={topUpBonuses.businessHubBonus}
                onChange={(e) => setTopUpBonuses({
                  ...topUpBonuses,
                  businessHubBonus: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
                max="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: ₱5,000 → ₱{5000 + (5000 * topUpBonuses.businessHubBonus / 100)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loading Station Bonus (%)
              </label>
              <input
                type="number"
                value={topUpBonuses.loadingStationBonus}
                onChange={(e) => setTopUpBonuses({
                  ...topUpBonuses,
                  loadingStationBonus: Number(e.target.value)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                min="0"
                max="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: ₱1,000 → ₱{1000 + (1000 * topUpBonuses.loadingStationBonus / 100)}
              </p>
            </div>

            <button
              onClick={handleBonusSave}
              disabled={saveLoading === 'bonus'}
              className={`w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow ${
                saveLoading === 'bonus' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saveLoading === 'bonus' ? 'Saving...' : 'Save Bonus Settings'}
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-xl font-semibold text-deep-black mb-6">System Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Maintenance Mode</label>
                <p className="text-sm text-gray-500">Disable platform access for maintenance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    maintenanceMode: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-orange"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">New Registrations</label>
                <p className="text-sm text-gray-500">Allow new user registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.newRegistrations}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    newRegistrations: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-orange"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Auto Approvals</label>
                <p className="text-sm text-gray-500">Automatically approve certain user types</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.autoApprovals}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    autoApprovals: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-orange"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Notifications</label>
                <p className="text-sm text-gray-500">Send system notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.notificationsEnabled}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    notificationsEnabled: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-orange"></div>
              </label>
            </div>

            <button
              onClick={handleSystemSettingsSave}
              disabled={saveLoading === 'system'}
              className={`w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow ${
                saveLoading === 'system' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saveLoading === 'system' ? 'Saving...' : 'Save System Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
        <h2 className="text-xl font-semibold text-deep-black mb-6">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-deep-black">v2.1.0</div>
            <div className="text-sm text-gray-600">Platform Version</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Configuration Changes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Commission rates updated</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Delivery pricing adjusted</span>
              <span className="text-gray-500">1 day ago</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>System maintenance completed</span>
              <span className="text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
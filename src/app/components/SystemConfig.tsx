'use client';

import { useState } from 'react';

export default function SystemConfig() {
  const [commissionRates, setCommissionRates] = useState({
    businessHub: 50,
    loadingStation: 20,
    rider: 18,
    platform: 12
  });

  const [deliveryPricing, setDeliveryPricing] = useState({
    baseRate: 65,
    perKmRate: 10
  });

  const [topUpBonuses, setTopUpBonuses] = useState({
    businessHubBonus: 50,
    loadingStationBonus: 25
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    autoApprovals: false,
    notificationsEnabled: true
  });

  const handleCommissionSave = () => {
    console.log('Saving commission rates:', commissionRates);
    alert('Commission rates updated successfully!');
  };

  const handleDeliveryPricingSave = () => {
    console.log('Saving delivery pricing:', deliveryPricing);
    alert('Delivery pricing updated successfully!');
  };

  const handleBonusSave = () => {
    console.log('Saving bonus settings:', topUpBonuses);
    alert('Bonus settings updated successfully!');
  };

  const handleSystemSettingsSave = () => {
    console.log('Saving system settings:', systemSettings);
    alert('System settings updated successfully!');
  };

  return (
    <div className="space-y-6">
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
              className="w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
            >
              Save Commission Rates
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
              className="w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
            >
              Save Delivery Pricing
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
              className="w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
            >
              Save Bonus Settings
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
              className="w-full lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
            >
              Save System Settings
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
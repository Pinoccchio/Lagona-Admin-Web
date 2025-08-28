'use client';

import { useState } from 'react';

interface BusinessHub {
  id: string;
  name: string;
  bhcode: string;
  location: string;
  territory: string;
  status: 'active' | 'inactive' | 'pending';
  loadingStations: number;
  monthlyRevenue: string;
  createdDate: string;
  manager: string;
  commission: number;
}

export default function BusinessHubs() {
  const [showModal, setShowModal] = useState(false);
  const [selectedHub, setSelectedHub] = useState<BusinessHub | null>(null);
  
  const businessHubs: BusinessHub[] = [
    {
      id: '1',
      name: 'Cebu City Hub',
      bhcode: 'CC001',
      location: 'Cebu City, Cebu',
      territory: 'Metro Cebu',
      status: 'active',
      loadingStations: 12,
      monthlyRevenue: '₱847,320',
      createdDate: '2024-01-15',
      manager: 'Juan Santos',
      commission: 50
    },
    {
      id: '2',
      name: 'Manila Hub',
      bhcode: 'MN001',
      location: 'Manila City, NCR',
      territory: 'Metro Manila',
      status: 'active',
      loadingStations: 24,
      monthlyRevenue: '₱1,245,800',
      createdDate: '2024-01-10',
      manager: 'Maria Garcia',
      commission: 50
    },
    {
      id: '3',
      name: 'Davao City Hub',
      bhcode: 'DC001',
      location: 'Davao City, Davao del Sur',
      territory: 'Mindanao Region',
      status: 'active',
      loadingStations: 8,
      monthlyRevenue: '₱523,150',
      createdDate: '2024-02-01',
      manager: 'Carlos Reyes',
      commission: 50
    },
    {
      id: '4',
      name: 'Baguio Hub',
      bhcode: 'BG001',
      location: 'Baguio City, Benguet',
      territory: 'Northern Luzon',
      status: 'pending',
      loadingStations: 3,
      monthlyRevenue: '₱156,240',
      createdDate: '2024-03-10',
      manager: 'Anna Cruz',
      commission: 50
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreate = () => {
    setSelectedHub(null);
    setShowModal(true);
  };

  const handleEdit = (hub: BusinessHub) => {
    setSelectedHub(hub);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedHub(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-deep-black">Business Hubs Management</h1>
          <p className="text-gray-600 mt-1">Manage municipality and city level hubs across territories</p>
        </div>
        <button
          onClick={handleCreate}
          className="lagona-gradient text-pure-white px-6 py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
        >
          + Create Business Hub
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hubs</p>
              <p className="text-3xl font-bold text-deep-black mt-2">{businessHubs.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Hubs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {businessHubs.filter(h => h.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loading Stations</p>
              <p className="text-3xl font-bold text-deep-black mt-2">
                {businessHubs.reduce((sum, hub) => sum + hub.loadingStations, 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-deep-black mt-2">₱2.8M</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hubs Table */}
      <div className="bg-pure-white rounded-xl lagona-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-deep-black">Business Hubs Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hub Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Territory</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Loading Stations</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {businessHubs.map((hub) => (
                <tr key={hub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-deep-black">{hub.name}</div>
                      <div className="text-sm text-gray-600">
                        BHCODE: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{hub.bhcode}</span>
                      </div>
                      <div className="text-sm text-gray-500">{hub.location}</div>
                      <div className="text-sm text-gray-500">Manager: {hub.manager}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{hub.territory}</div>
                    <div className="text-sm text-gray-500">Commission: {hub.commission}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-2xl font-bold text-deep-black">{hub.loadingStations}</div>
                    <div className="text-sm text-gray-500">stations</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-green-600">{hub.monthlyRevenue}</div>
                    <div className="text-sm text-gray-500">monthly</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hub.status)}`}>
                      {hub.status.charAt(0).toUpperCase() + hub.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(hub)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                        View Stations
                      </button>
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pure-white rounded-xl p-8 max-w-2xl w-full mx-4 lagona-shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-deep-black">
                {selectedHub ? 'Edit Business Hub' : 'Create New Business Hub'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Hub Name</label>
                  <input
                    type="text"
                    defaultValue={selectedHub?.name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Cebu City Hub"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">BHCODE</label>
                  <input
                    type="text"
                    defaultValue={selectedHub?.bhcode || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., CC001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={selectedHub?.location || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., Cebu City, Cebu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Territory Coverage</label>
                <input
                  type="text"
                  defaultValue={selectedHub?.territory || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., Metro Cebu"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Manager Name</label>
                  <input
                    type="text"
                    defaultValue={selectedHub?.manager || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Juan Santos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Commission Rate (%)</label>
                  <input
                    type="number"
                    defaultValue={selectedHub?.commission || 50}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
                >
                  {selectedHub ? 'Update Hub' : 'Create Hub'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
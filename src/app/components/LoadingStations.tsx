'use client';

import { useState } from 'react';

interface LoadingStation {
  id: string;
  name: string;
  lscode: string;
  businessHub: string;
  bhcode: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  activeRiders: number;
  monthlyRevenue: string;
  commission: number;
  manager: string;
  createdDate: string;
}

export default function LoadingStations() {
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<LoadingStation | null>(null);
  const [filterHub, setFilterHub] = useState('all');
  
  const loadingStations: LoadingStation[] = [
    {
      id: '1',
      name: 'Lahug Loading Station',
      lscode: 'CC001-LH01',
      businessHub: 'Cebu City Hub',
      bhcode: 'CC001',
      location: 'Lahug, Cebu City',
      status: 'active',
      activeRiders: 15,
      monthlyRevenue: '₱84,320',
      commission: 20,
      manager: 'Pedro Morales',
      createdDate: '2024-01-20'
    },
    {
      id: '2',
      name: 'IT Park Station',
      lscode: 'CC001-IT01',
      businessHub: 'Cebu City Hub',
      bhcode: 'CC001',
      location: 'IT Park, Cebu City',
      status: 'active',
      activeRiders: 22,
      monthlyRevenue: '₱112,450',
      commission: 20,
      manager: 'Lisa Fernandez',
      createdDate: '2024-01-25'
    },
    {
      id: '3',
      name: 'Ayala Station',
      lscode: 'CC001-AY01',
      businessHub: 'Cebu City Hub',
      bhcode: 'CC001',
      location: 'Ayala Center, Cebu City',
      status: 'active',
      activeRiders: 28,
      monthlyRevenue: '₱145,680',
      commission: 22,
      manager: 'Rico Santos',
      createdDate: '2024-02-01'
    },
    {
      id: '4',
      name: 'Makati Station',
      lscode: 'MN001-MK01',
      businessHub: 'Manila Hub',
      bhcode: 'MN001',
      location: 'Makati City, NCR',
      status: 'active',
      activeRiders: 35,
      monthlyRevenue: '₱198,750',
      commission: 20,
      manager: 'Jennifer Cruz',
      createdDate: '2024-01-15'
    },
    {
      id: '5',
      name: 'BGC Station',
      lscode: 'MN001-BG01',
      businessHub: 'Manila Hub',
      bhcode: 'MN001',
      location: 'BGC, Taguig City',
      status: 'maintenance',
      activeRiders: 12,
      monthlyRevenue: '₱67,200',
      commission: 20,
      manager: 'Mark Gonzales',
      createdDate: '2024-02-10'
    },
    {
      id: '6',
      name: 'Davao Central',
      lscode: 'DC001-CT01',
      businessHub: 'Davao City Hub',
      bhcode: 'DC001',
      location: 'Downtown Davao',
      status: 'active',
      activeRiders: 18,
      monthlyRevenue: '₱95,430',
      commission: 20,
      manager: 'Sarah Villanueva',
      createdDate: '2024-02-05'
    }
  ];

  const businessHubs = Array.from(new Set(loadingStations.map(station => station.businessHub)));

  const filteredStations = filterHub === 'all' 
    ? loadingStations 
    : loadingStations.filter(station => station.businessHub === filterHub);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreate = () => {
    setSelectedStation(null);
    setShowModal(true);
  };

  const handleEdit = (station: LoadingStation) => {
    setSelectedStation(station);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-deep-black">Loading Stations Management</h1>
          <p className="text-gray-600 mt-1">Manage area-level loading stations under Business Hubs</p>
        </div>
        <button
          onClick={handleCreate}
          className="lagona-gradient text-pure-white px-6 py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
        >
          + Create Loading Station
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stations</p>
              <p className="text-3xl font-bold text-deep-black mt-2">{loadingStations.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Stations</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loadingStations.filter(s => s.status === 'active').length}
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
              <p className="text-sm font-medium text-gray-600">Total Riders</p>
              <p className="text-3xl font-bold text-deep-black mt-2">
                {loadingStations.reduce((sum, station) => sum + station.activeRiders, 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-deep-black mt-2">₱704K</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-600">Filter by Business Hub:</label>
            <select
              value={filterHub}
              onChange={(e) => setFilterHub(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              <option value="all">All Hubs</option>
              {businessHubs.map(hub => (
                <option key={hub} value={hub}>{hub}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Showing {filteredStations.length} stations</span>
          </div>
        </div>
      </div>

      {/* Loading Stations Table */}
      <div className="bg-pure-white rounded-xl lagona-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Station Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Business Hub</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Riders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Commission</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-deep-black">{station.name}</div>
                      <div className="text-sm text-gray-600">
                        LSCODE: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{station.lscode}</span>
                      </div>
                      <div className="text-sm text-gray-500">{station.location}</div>
                      <div className="text-sm text-gray-500">Manager: {station.manager}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{station.businessHub}</div>
                    <div className="text-sm text-gray-500">
                      BHCODE: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{station.bhcode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-2xl font-bold text-blue-600">{station.activeRiders}</div>
                    <div className="text-sm text-gray-500">active riders</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-green-600">{station.monthlyRevenue}</div>
                    <div className="text-sm text-gray-500">monthly</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-deep-black">{station.commission}%</div>
                    <div className="text-sm text-gray-500">commission</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(station.status)}`}>
                      {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(station)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                        View Riders
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
                {selectedStation ? 'Edit Loading Station' : 'Create New Loading Station'}
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
                  <label className="block text-sm font-medium text-deep-black mb-2">Station Name</label>
                  <input
                    type="text"
                    defaultValue={selectedStation?.name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Lahug Loading Station"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">LSCODE</label>
                  <input
                    type="text"
                    defaultValue={selectedStation?.lscode || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., CC001-LH01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Business Hub</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent">
                  <option value="">Select Business Hub</option>
                  {businessHubs.map(hub => (
                    <option key={hub} value={hub} selected={selectedStation?.businessHub === hub}>
                      {hub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={selectedStation?.location || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., Lahug, Cebu City"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Manager Name</label>
                  <input
                    type="text"
                    defaultValue={selectedStation?.manager || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Pedro Morales"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Commission Rate (%)</label>
                  <input
                    type="number"
                    defaultValue={selectedStation?.commission || 20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="20"
                    min="15"
                    max="30"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
                >
                  {selectedStation ? 'Update Station' : 'Create Station'}
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
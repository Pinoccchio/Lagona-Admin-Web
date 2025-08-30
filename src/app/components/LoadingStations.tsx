'use client';

import { useState, useEffect } from 'react';
import { loadingStationService } from '@/services/loadingStationService';
import { businessHubService } from '@/services/businessHubService';
import type { Database } from '@/lib/supabase/types';

type LoadingStation = Database['public']['Tables']['loading_stations']['Row'] & {
  ridersCount?: number;
  business_hubs?: {
    id: string;
    bhcode: string;
    name: string;
    municipality: string;
  } | null;
  users?: {
    email: string | null;
    phone_number: string | null;
    full_name: string | null;
  } | null;
};

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'];

type FormData = {
  name: string;
  area: string;
  address: string;
  business_hub_id: string;
  commission_rate: string;
  manager_name: string;
  phone_number: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function LoadingStations() {
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<LoadingStation | null>(null);
  const [filterHub, setFilterHub] = useState('all');
  const [loadingStations, setLoadingStations] = useState<LoadingStation[]>([]);
  const [businessHubs, setBusinessHubs] = useState<BusinessHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    area: '',
    address: '',
    business_hub_id: '',
    commission_rate: '20',
    manager_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<LoadingStation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

  useEffect(() => {
    fetchLoadingStations();
    fetchBusinessHubs();
    fetchStatistics();
  }, []);

  const fetchLoadingStations = async () => {
    try {
      setLoading(true);
      const stations = await loadingStationService.getAllLoadingStations();
      
      // Add riders count for each station
      const stationsWithRiders = await Promise.all(
        stations.map(async (station) => {
          try {
            // Note: We'll need to add a service method to get riders by loading station
            // For now, we'll set ridersCount to 0 and can implement later
            return {
              ...station,
              ridersCount: 0
            };
          } catch (err) {
            console.error('Error fetching riders for station:', station.id, err);
            return {
              ...station,
              ridersCount: 0
            };
          }
        })
      );
      
      setLoadingStations(stationsWithRiders);
    } catch (err) {
      console.error('Error fetching loading stations:', err);
      setError('Failed to load loading stations');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessHubs = async () => {
    try {
      const hubs = await businessHubService.getAllBusinessHubs();
      setBusinessHubs(hubs);
    } catch (err) {
      console.error('Error fetching business hubs:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await loadingStationService.getLoadingStationStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Remove this mock data array:
  // Mock data removed - now using real data from Supabase

  const displayStations = filterHub === 'all' 
    ? loadingStations 
    : loadingStations.filter(station => station.business_hub_id === filterHub);

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
    setFormData({
      name: '',
      area: '',
      address: '',
      business_hub_id: '',
      commission_rate: '20',
      manager_name: '',
      phone_number: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const handleEdit = (station: LoadingStation) => {
    setSelectedStation(station);
    setFormData({
      name: station.name,
      area: station.area,
      address: station.address,
      business_hub_id: station.business_hub_id,
      commission_rate: (station.commission_rate || 20).toString(),
      manager_name: station.users?.full_name || '',
      phone_number: station.users?.phone_number || '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormError(null);
    setSuccessMessage(null);
    setShowModal(true);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (formError) setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Station name is required';
    if (!formData.area.trim()) return 'Area is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.business_hub_id) return 'Business Hub selection is required';
    
    const commissionRate = parseFloat(formData.commission_rate);
    if (isNaN(commissionRate) || commissionRate < 15 || commissionRate > 30) {
      return 'Commission rate must be between 15% and 30%';
    }
    
    // Phone number validation (optional but check format if provided)
    if (formData.phone_number.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone_number.replace(/\s|-|\(|\)/g, ''))) {
        return 'Please enter a valid phone number (e.g., +63 912 345 6789)';
      }
    }
    
    // Auth fields validation (only for new stations)
    if (!selectedStation) {
      if (!formData.manager_name.trim()) return 'Manager name is required';
      if (!formData.email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
      if (!formData.password.trim()) return 'Password is required';
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }
    
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      if (selectedStation) {
        // Update existing station
        await loadingStationService.updateLoadingStation(selectedStation.id, {
          name: formData.name,
          area: formData.area,
          address: formData.address,
          business_hub_id: formData.business_hub_id,
          commission_rate: parseFloat(formData.commission_rate),
          updated_at: new Date().toISOString()
        }, formData.phone_number, formData.manager_name);
        setSuccessMessage('Loading station updated successfully!');
      } else {
        // Create new station with user account
        await loadingStationService.createLoadingStationWithAuth({
          name: formData.name,
          area: formData.area,
          address: formData.address,
          business_hub_id: formData.business_hub_id,
          commission_rate: parseFloat(formData.commission_rate),
          manager_name: formData.manager_name,
          phone_number: formData.phone_number,
          email: formData.email,
          password: formData.password
        });
        setSuccessMessage('Loading station and mobile app account created successfully!');
      }

      // Refresh the list
      await fetchLoadingStations();
      await fetchStatistics();
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSelectedStation(null);
        setSuccessMessage(null);
      }, 2000);

    } catch (err: any) {
      console.error('Error saving loading station:', err);
      setFormError(err.message || 'Failed to save loading station');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (station: LoadingStation) => {
    setStationToDelete(station);
    setDeleteError(null);
    setDeleteConfirmationName('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!stationToDelete) return;

    // Check if name confirmation matches
    if (deleteConfirmationName !== stationToDelete.name) {
      setDeleteError('Please type the exact station name to confirm deletion');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await loadingStationService.deleteLoadingStation(stationToDelete.id);
      
      setSuccessMessage('Loading station deleted successfully!');
      setShowDeleteModal(false);
      setStationToDelete(null);
      setDeleteConfirmationName('');
      
      // Refresh the list
      await fetchLoadingStations();
      await fetchStatistics();
      
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting loading station:', err);
      setDeleteError(err.message || 'Failed to delete loading station');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStationToDelete(null);
    setDeleteError(null);
    setDeleteConfirmationName('');
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

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
              <p className="text-3xl font-bold text-deep-black mt-2">{loading ? '...' : (statistics?.totalStations || loadingStations.length)}</p>
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
                {loading ? '...' : (statistics?.activeStations || loadingStations.filter(s => s.status === 'active').length)}
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
                {loading ? '...' : (statistics?.totalRiders || 0)}
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-deep-black mt-2">
                {loading ? '...' : `₱${((statistics?.totalRevenue || 0) / 1000).toFixed(1)}K`}
              </p>
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
                <option key={hub.id} value={hub.id}>{hub.name} ({hub.bhcode})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Showing {displayStations.length} stations</span>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Manager Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Business Hub</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Riders & Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Balance Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status & Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading loading stations...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : displayStations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No loading stations found
                  </td>
                </tr>
              ) : displayStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  {/* Station Details */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-deep-black">{station.name}</div>
                      <div className="text-sm text-gray-600">
                        LSCODE: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{station.lscode}</span>
                      </div>
                      <div className="text-sm text-gray-500">{station.area}</div>
                      <div className="text-sm text-gray-500">{station.address}</div>
                    </div>
                  </td>
                  
                  {/* Manager Info */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{station.users?.full_name || 'N/A'}</div>
                      {station.users?.phone_number && (
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {station.users.phone_number}
                        </div>
                      )}
                      {station.users?.email && (
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {station.users.email}
                        </div>
                      )}
                      {!station.users?.phone_number && !station.users?.email && (
                        <div className="text-sm text-gray-400">No contact info</div>
                      )}
                    </div>
                  </td>
                  
                  {/* Business Hub */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{station.business_hubs?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      BHCODE: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{station.business_hubs?.bhcode || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-500">{station.business_hubs?.municipality || ''}</div>
                  </td>
                  
                  {/* Riders & Revenue */}
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-blue-600">{station.ridersCount || 0}</div>
                    <div className="text-sm text-gray-500">active riders</div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      ₱{((station.total_revenue || 0) / 1000).toFixed(1)}K revenue
                    </div>
                  </td>
                  
                  {/* Balance Info */}
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-blue-600">₱{((station as any).current_balance || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">current balance</div>
                    <div className="text-sm text-gray-400 mt-1">Commission: {station.commission_rate || 20}%</div>
                  </td>
                  
                  {/* Status & Date */}
                  <td className="px-6 py-4">
                    <div className="mb-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(station.status || 'pending')}`}>
                        {(station.status || 'pending').charAt(0).toUpperCase() + (station.status || 'pending').slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {station.created_at ? new Date(station.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <button
                        onClick={() => handleEdit(station)}
                        className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button className="block w-full text-left text-green-600 hover:text-green-700 font-medium text-sm">
                        View Riders
                      </button>
                      <button className="block w-full text-left text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Top-up
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(station)}
                        className="block w-full text-left text-red-600 hover:text-red-700 font-medium text-sm"
                      >
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
              <div className="flex items-center space-x-3">
                {selectedStation ? (
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 rounded-xl">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-deep-black">
                    {selectedStation ? 'Edit Loading Station' : 'Create New Loading Station'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedStation ? 'Update loading station information' : 'Set up a new area-level delivery station'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Error Message */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {formError}
              </div>
            )}

            {/* Success Message in Modal */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {successMessage}
              </div>
            )}

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Station Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Lahug Loading Station"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">LSCODE</label>
                  <input
                    type="text"
                    value={selectedStation?.lscode || 'Auto-generated'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Business Hub *</label>
                <select 
                  value={formData.business_hub_id}
                  onChange={(e) => handleInputChange('business_hub_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  disabled={formLoading}
                >
                  <option value="">Select Business Hub</option>
                  {businessHubs.map(hub => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name} ({hub.bhcode}) - {hub.municipality}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Area *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Lahug"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Commission Rate (%) *</label>
                  <input
                    type="number"
                    value={formData.commission_rate}
                    onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="20"
                    min="15"
                    max="30"
                    step="0.1"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Complete Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., 123 Main Street, Lahug, Cebu City, 6000"
                  rows={3}
                  disabled={formLoading}
                />
              </div>

              {/* Manager Information - Available for both new and existing stations */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-deep-black mb-4">Manager Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-deep-black mb-2">Manager Name {!selectedStation && '*'}</label>
                    <input
                      type="text"
                      value={formData.manager_name}
                      onChange={(e) => handleInputChange('manager_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="e.g., Pedro Morales"
                      disabled={formLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-deep-black mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="e.g., +63 912 345 6789"
                      disabled={formLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional. Include country code for international numbers
                    </p>
                  </div>
                </div>
              </div>

              {!selectedStation && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-deep-black mb-4">Station Manager Login Credentials</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Station manager will use these credentials to login to their mobile app
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-deep-black mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="e.g., manager@station.com"
                        disabled={formLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-deep-black mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                          placeholder="Minimum 8 characters"
                          disabled={formLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                          disabled={formLoading}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-black mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Re-enter password"
                        disabled={formLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        disabled={formLoading}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={formLoading}
                  className={`flex-1 lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow ${
                    formLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {formLoading ? 'Saving...' : (selectedStation ? 'Update Station' : 'Create Station')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && stationToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 transform animate-in">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delete Loading Station</h2>
                  <p className="text-gray-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
              <button 
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
            
            {/* Station Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Station Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{stationToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">LSCODE:</span>
                  <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-900">{stationToDelete.lscode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Area:</span>
                  <span className="text-sm text-gray-900">{stationToDelete.area}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Manager:</span>
                  <span className="text-sm text-gray-900">{stationToDelete.users?.full_name || 'N/A'}</span>
                </div>
                {stationToDelete.ridersCount && stationToDelete.ridersCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Active Riders:</span>
                    <span className="text-sm font-semibold text-orange-600">{stationToDelete.ridersCount} riders</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">Warning: Permanent Deletion</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• This loading station will be permanently deleted</li>
                    <li>• All associated riders may be affected</li>
                    <li>• Transaction history will be preserved</li>
                    <li>• This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-600">{deleteError}</p>
              </div>
            )}

            {/* Name Confirmation */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type <span className="font-bold text-red-600">"{stationToDelete.name}"</span> to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={stationToDelete.name}
                disabled={isDeleting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting || deleteConfirmationName !== stationToDelete.name}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Loading Station'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
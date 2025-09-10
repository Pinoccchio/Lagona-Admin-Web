'use client'

import { useState, useEffect } from 'react'
import { Rider, riderService } from '@/services/riderService'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function Riders() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'online' | 'available'>('all')
  
  const [formData, setFormData] = useState({
    loading_station_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    emergency_contact: {
      name: '',
      relationship: '',
      phone_number: ''
    },
    vehicle_type: 'motorcycle',
    vehicle_details: {
      brand: '',
      model: '',
      year: 2024,
      color: '',
      plate_number: ''
    }
  })

  const vehicleTypes = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'car', label: 'Car' },
    { value: 'tricycle', label: 'Tricycle' }
  ]

  const relationships = [
    'Spouse', 'Parent', 'Child', 'Sibling', 'Relative', 'Friend', 'Other'
  ]

  useEffect(() => {
    fetchRiders()
    fetchStatistics()
  }, [])

  const fetchRiders = async () => {
    try {
      setLoading(true)
      const data = await riderService.getAllRiders()
      setRiders(data)
    } catch (error) {
      console.error('Error fetching riders:', error)
      toast.error('Failed to load riders')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const stats = await riderService.getRiderStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleAddRider = async () => {
    try {
      await riderService.createRider(formData)
      toast.success('Rider added successfully')
      setShowAddModal(false)
      resetForm()
      fetchRiders()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add rider')
    }
  }

  const handleUpdateRider = async () => {
    if (!selectedRider) return
    
    try {
      await riderService.updateRider(selectedRider.id, {
        phone_number: formData.phone_number,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        vehicle_details: formData.vehicle_details
      })
      toast.success('Rider updated successfully')
      setShowEditModal(false)
      resetForm()
      fetchRiders()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update rider')
    }
  }

  const handleApproveRider = async (id: string) => {
    try {
      await riderService.approveRider(id, 'admin-1')
      toast.success('Rider approved successfully')
      fetchRiders()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve rider')
    }
  }

  const handleRejectRider = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    
    try {
      await riderService.rejectRider(id, reason, 'admin-1')
      toast.success('Rider rejected')
      fetchRiders()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject rider')
    }
  }

  const handleDeleteRider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rider? This action cannot be undone.')) return
    
    try {
      await riderService.deleteRider(id)
      toast.success('Rider deleted successfully')
      fetchRiders()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete rider')
    }
  }

  const resetForm = () => {
    setFormData({
      loading_station_id: '',
      full_name: '',
      email: '',
      phone_number: '',
      address: '',
      emergency_contact: {
        name: '',
        relationship: '',
        phone_number: ''
      },
      vehicle_type: 'motorcycle',
      vehicle_details: {
        brand: '',
        model: '',
        year: 2024,
        color: '',
        plate_number: ''
      }
    })
    setSelectedRider(null)
  }

  const openEditModal = (rider: Rider) => {
    setSelectedRider(rider)
    setFormData({
      loading_station_id: rider.loading_station_id,
      full_name: rider.full_name,
      email: rider.email,
      phone_number: rider.phone_number,
      address: rider.address,
      emergency_contact: rider.emergency_contact,
      vehicle_type: rider.vehicle_type,
      vehicle_details: rider.vehicle_details
    })
    setShowEditModal(true)
  }

  const openDetailsModal = (rider: Rider) => {
    setSelectedRider(rider)
    setShowDetailsModal(true)
  }

  const filteredRiders = riders.filter(rider => {
    switch (activeTab) {
      case 'all': return true
      case 'pending': return rider.status === 'pending'
      case 'active': return rider.status === 'active'
      case 'online': return rider.is_online && rider.status === 'active'
      case 'available': return rider.is_available && rider.status === 'active'
      default: return true
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOnlineStatus = (rider: Rider) => {
    if (rider.status !== 'active') return { text: 'Offline', color: 'text-gray-500' }
    if (rider.is_online && rider.is_available) return { text: 'Available', color: 'text-green-600' }
    if (rider.is_online) return { text: 'Online', color: 'text-blue-600' }
    return { text: 'Offline', color: 'text-gray-500' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Riders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.totalRiders || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.activeRiders || 0} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Now</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.onlineRiders || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.availableRiders || 0} available
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.pendingRiders || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(statistics?.totalDeliveries || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.completionRate || 0}% completion rate
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱{(statistics?.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.averageRating || 0}★ avg rating
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Riders</h2>
              <div className="flex space-x-1">
                {(['all', 'pending', 'active', 'online', 'available'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                    {tab !== 'all' && (
                      <span className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded-full">
                        {statistics && statistics[`${tab}Riders`]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Rider</span>
            </button>
          </div>
        </div>

        {/* Riders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loading Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deliveries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRiders.map((rider) => {
                const onlineStatus = getOnlineStatus(rider)
                return (
                  <tr key={rider.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {rider.full_name}
                            {rider.is_online && (
                              <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{rider.email}</div>
                          <div className={`text-xs ${onlineStatus.color}`}>
                            {onlineStatus.text}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {rider.rider_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rider.loading_stations?.station_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rider.loading_stations?.municipality}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {rider.vehicle_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rider.vehicle_details.brand} {rider.vehicle_details.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rider.vehicle_details.plate_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rider.total_deliveries.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rider.completed_deliveries} completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₱{rider.total_earnings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Balance: ₱{rider.current_balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rider.average_rating > 0 
                        ? `${rider.average_rating}★ (${rider.rating_count})`
                        : 'No ratings'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rider.status)}`}>
                        {rider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="space-y-2">
                        <button
                          onClick={() => openDetailsModal(rider)}
                          className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </button>
                        {rider.status === 'pending' && (
                          <button
                            onClick={() => setSelectedRider(rider) || setShowDocumentsModal(true)}
                            className="block w-full text-left text-purple-600 hover:text-purple-700 font-medium text-sm"
                          >
                            View Documents
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(rider)}
                          className="block w-full text-left text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        {rider.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRider(rider.id)}
                              className="block w-full text-left text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRider(rider.id)}
                              className="block w-full text-left text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRider(rider.id)}
                          className="block w-full text-left text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Rider Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">
              {showAddModal ? 'Add New Rider' : 'Edit Rider'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Personal Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Personal Information</h4>
                
                {showAddModal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loading Station
                    </label>
                    <select
                      value={formData.loading_station_id}
                      onChange={(e) => setFormData({ ...formData, loading_station_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Loading Station</option>
                      <option value="ls-1">Tagbilaran Central Station</option>
                      <option value="ls-2">Dao Loading Station</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={showEditModal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={showEditModal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter complete address"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Emergency Contact</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergency_contact: {
                            ...formData.emergency_contact,
                            name: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={formData.emergency_contact.relationship}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergency_contact: {
                            ...formData.emergency_contact,
                            relationship: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select relationship</option>
                        {relationships.map((rel) => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact.phone_number}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergency_contact: {
                            ...formData.emergency_contact,
                            phone_number: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Vehicle Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Vehicle Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    disabled={showEditModal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_details.brand}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle_details: {
                          ...formData.vehicle_details,
                          brand: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Honda"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_details.model}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle_details: {
                          ...formData.vehicle_details,
                          model: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Click 150i"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.vehicle_details.year}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle_details: {
                          ...formData.vehicle_details,
                          year: parseInt(e.target.value)
                        }
                      })}
                      min="2000"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_details.color}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle_details: {
                          ...formData.vehicle_details,
                          color: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Vehicle color"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_details.plate_number}
                    onChange={(e) => setFormData({
                      ...formData,
                      vehicle_details: {
                        ...formData.vehicle_details,
                        plate_number: e.target.value.toUpperCase()
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ABC-1234"
                  />
                </div>

                {/* Document Requirements Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Required Documents</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">The following documents are required for rider approval:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Driver's License</li>
                      <li>• Official Receipt & Certificate of Registration (OR/CR)</li>
                      <li>• Vehicle Insurance</li>
                      <li>• Barangay Clearance</li>
                      <li>• Police Clearance</li>
                      <li>• Medical Certificate</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Documents can be uploaded after account creation through the rider mobile app.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddRider : handleUpdateRider}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showAddModal ? 'Add Rider' : 'Update Rider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rider Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rider Code</label>
                      <p className="text-blue-600 font-medium">{selectedRider.rider_code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{selectedRider.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedRider.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedRider.phone_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{selectedRider.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Loading Station</label>
                      <p className="text-gray-900">{selectedRider.loading_stations?.station_name}</p>
                      <p className="text-sm text-gray-500">{selectedRider.loading_stations?.municipality}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Emergency Contact</h4>
                  <div className="space-y-1">
                    <p className="text-gray-900">{selectedRider.emergency_contact.name}</p>
                    <p className="text-sm text-gray-500">{selectedRider.emergency_contact.relationship}</p>
                    <p className="text-sm text-gray-600">{selectedRider.emergency_contact.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Vehicle Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-gray-900 capitalize">{selectedRider.vehicle_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vehicle</label>
                      <p className="text-gray-900">
                        {selectedRider.vehicle_details.brand} {selectedRider.vehicle_details.model} ({selectedRider.vehicle_details.year})
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Color</label>
                      <p className="text-gray-900">{selectedRider.vehicle_details.color}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plate Number</label>
                      <p className="text-gray-900 font-medium">{selectedRider.vehicle_details.plate_number}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Performance Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Deliveries</label>
                      <p className="text-gray-900">{selectedRider.total_deliveries}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Completed</label>
                      <p className="text-gray-900">{selectedRider.completed_deliveries}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Earnings</label>
                      <p className="text-gray-900">₱{selectedRider.total_earnings.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Balance</label>
                      <p className="text-gray-900">₱{selectedRider.current_balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rating</label>
                      <p className="text-gray-900">
                        {selectedRider.average_rating > 0 
                          ? `${selectedRider.average_rating}★ (${selectedRider.rating_count} reviews)`
                          : 'No ratings yet'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                      <p className="text-gray-900">{selectedRider.commission_rate}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRider.status)}`}>
                        {selectedRider.status}
                      </span>
                      {selectedRider.is_online && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Online
                        </span>
                      )}
                      {selectedRider.is_available && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Available
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joined</label>
                      <p className="text-gray-900">{format(new Date(selectedRider.created_at), 'PPpp')}</p>
                    </div>
                    {selectedRider.approved_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Approved</label>
                        <p className="text-gray-900">{format(new Date(selectedRider.approved_at), 'PPpp')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Review Modal */}
      {showDocumentsModal && selectedRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Document Review</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Reviewing documents for: <span className="font-medium text-blue-600">{selectedRider.full_name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Document Status Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900">Application Status</h4>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">6</div>
                  <div className="text-gray-600">Required Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">4</div>
                  <div className="text-gray-600">Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">2</div>
                  <div className="text-gray-600">Missing</div>
                </div>
              </div>
            </div>

            {/* Required Documents List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">Required Documents</h4>
              
              {[
                { 
                  name: "Driver's License", 
                  required: true, 
                  submitted: true, 
                  status: "approved",
                  uploadDate: "2024-01-15",
                  notes: "Valid until 2027"
                },
                { 
                  name: "OR/CR (Vehicle Registration)", 
                  required: true, 
                  submitted: true, 
                  status: "pending",
                  uploadDate: "2024-01-15",
                  notes: "Needs verification"
                },
                { 
                  name: "Vehicle Insurance", 
                  required: true, 
                  submitted: true, 
                  status: "approved",
                  uploadDate: "2024-01-14",
                  notes: "Comprehensive coverage"
                },
                { 
                  name: "Barangay Clearance", 
                  required: true, 
                  submitted: true, 
                  status: "pending",
                  uploadDate: "2024-01-16",
                  notes: "Recent clearance"
                },
                { 
                  name: "Police Clearance", 
                  required: true, 
                  submitted: false, 
                  status: "missing",
                  uploadDate: null,
                  notes: "Required for background check"
                },
                { 
                  name: "Medical Certificate", 
                  required: true, 
                  submitted: false, 
                  status: "missing",
                  uploadDate: null,
                  notes: "Must be within 6 months"
                }
              ].map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        doc.status === 'approved' ? 'bg-green-500' :
                        doc.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <h5 className="font-medium text-gray-900">{doc.name}</h5>
                      {doc.required && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Required</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.status === 'approved' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Approved</span>
                      )}
                      {doc.status === 'pending' && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                      )}
                      {doc.status === 'missing' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Missing</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Status:</span> {
                        doc.status === 'approved' ? 'Approved' :
                        doc.status === 'pending' ? 'Under Review' :
                        'Not Submitted'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span> {doc.uploadDate || 'Not uploaded'}
                    </div>
                    <div>
                      <span className="font-medium">Notes:</span> {doc.notes}
                    </div>
                  </div>

                  {doc.submitted && (
                    <div className="flex items-center space-x-3">
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors">
                        View Document
                      </button>
                      {doc.status === 'pending' && (
                        <>
                          <button className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors">
                            Approve
                          </button>
                          <button className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {doc.status === 'approved' && (
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                          Revoke Approval
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Send Message to Rider
                </button>
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Request Missing Documents
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDocumentsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                  Reject Application
                </button>
                <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors">
                  Approve Rider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
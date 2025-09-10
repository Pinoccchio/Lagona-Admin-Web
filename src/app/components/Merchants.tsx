'use client'

import { useState, useEffect } from 'react'
import { Merchant, merchantService } from '@/services/merchantService'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function Merchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'suspended'>('all')
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'restaurant',
    business_description: '',
    email: '',
    phone_number: '',
    address: '',
    commission_rate: 15,
    minimum_order: 150,
    delivery_radius: 5,
    operating_hours: {
      monday: { open: '09:00', close: '21:00', is_closed: false },
      tuesday: { open: '09:00', close: '21:00', is_closed: false },
      wednesday: { open: '09:00', close: '21:00', is_closed: false },
      thursday: { open: '09:00', close: '21:00', is_closed: false },
      friday: { open: '09:00', close: '21:00', is_closed: false },
      saturday: { open: '09:00', close: '21:00', is_closed: false },
      sunday: { open: '09:00', close: '21:00', is_closed: false }
    }
  })

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'other', label: 'Other' }
  ]

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    fetchMerchants()
    fetchStatistics()
  }, [])

  const fetchMerchants = async () => {
    try {
      setLoading(true)
      const data = await merchantService.getAllMerchants()
      setMerchants(data)
    } catch (error) {
      console.error('Error fetching merchants:', error)
      toast.error('Failed to load merchants')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const stats = await merchantService.getMerchantStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleAddMerchant = async () => {
    try {
      await merchantService.createMerchant(formData)
      toast.success('Merchant added successfully')
      setShowAddModal(false)
      resetForm()
      fetchMerchants()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add merchant')
    }
  }

  const handleUpdateMerchant = async () => {
    if (!selectedMerchant) return
    
    try {
      await merchantService.updateMerchant(selectedMerchant.id, {
        business_description: formData.business_description,
        phone_number: formData.phone_number,
        address: formData.address,
        operating_hours: formData.operating_hours,
        commission_rate: formData.commission_rate,
        minimum_order: formData.minimum_order,
        delivery_radius: formData.delivery_radius
      })
      toast.success('Merchant updated successfully')
      setShowEditModal(false)
      resetForm()
      fetchMerchants()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update merchant')
    }
  }

  const handleApproveMerchant = async (id: string) => {
    try {
      await merchantService.approveMerchant(id, 'admin-1')
      toast.success('Merchant approved successfully')
      fetchMerchants()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve merchant')
    }
  }

  const handleRejectMerchant = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    
    try {
      await merchantService.rejectMerchant(id, reason, 'admin-1')
      toast.success('Merchant rejected')
      fetchMerchants()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject merchant')
    }
  }

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this merchant? This action cannot be undone.')) return
    
    try {
      await merchantService.deleteMerchant(id)
      toast.success('Merchant deleted successfully')
      fetchMerchants()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete merchant')
    }
  }

  const resetForm = () => {
    setFormData({
      business_name: '',
      business_type: 'restaurant',
      business_description: '',
      email: '',
      phone_number: '',
      address: '',
      commission_rate: 15,
      minimum_order: 150,
      delivery_radius: 5,
      operating_hours: {
        monday: { open: '09:00', close: '21:00', is_closed: false },
        tuesday: { open: '09:00', close: '21:00', is_closed: false },
        wednesday: { open: '09:00', close: '21:00', is_closed: false },
        thursday: { open: '09:00', close: '21:00', is_closed: false },
        friday: { open: '09:00', close: '21:00', is_closed: false },
        saturday: { open: '09:00', close: '21:00', is_closed: false },
        sunday: { open: '09:00', close: '21:00', is_closed: false }
      }
    })
    setSelectedMerchant(null)
  }

  const openEditModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
    setFormData({
      business_name: merchant.business_name,
      business_type: merchant.business_type,
      business_description: merchant.business_description,
      email: merchant.email,
      phone_number: merchant.phone_number,
      address: merchant.address,
      commission_rate: merchant.commission_rate,
      minimum_order: merchant.minimum_order,
      delivery_radius: merchant.delivery_radius,
      operating_hours: merchant.operating_hours
    })
    setShowEditModal(true)
  }

  const openDetailsModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
    setShowDetailsModal(true)
  }

  const filteredMerchants = merchants.filter(merchant => {
    if (activeTab === 'all') return true
    return merchant.status === activeTab
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Merchants</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.totalMerchants || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.activeMerchants || 0} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.pendingMerchants || 0}
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱{(statistics?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.totalOrders || 0} total orders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.averageRating || 0}★
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Merchants</h2>
              <div className="flex space-x-1">
                {(['all', 'pending', 'active', 'suspended'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab}
                    {tab !== 'all' && (
                      <span className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded-full">
                        {statistics && statistics[`${tab}Merchants`]}
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
              <span>Add Merchant</span>
            </button>
          </div>
        </div>

        {/* Merchants Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
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
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {merchant.business_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {merchant.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {merchant.business_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{merchant.email}</div>
                    <div className="text-sm text-gray-500">{merchant.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {merchant.commission_rate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {merchant.total_orders.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {merchant.average_rating > 0 ? `${merchant.average_rating}★ (${merchant.rating_count})` : 'No ratings'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(merchant.status)}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-y-2">
                      <button
                        onClick={() => openDetailsModal(merchant)}
                        className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </button>
                      {merchant.status === 'pending' && (
                        <button
                          onClick={() => setSelectedMerchant(merchant) || setShowDocumentsModal(true)}
                          className="block w-full text-left text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          View Documents
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(merchant)}
                        className="block w-full text-left text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      {merchant.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveMerchant(merchant.id)}
                            className="block w-full text-left text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectMerchant(merchant.id)}
                            className="block w-full text-left text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteMerchant(merchant.id)}
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

      {/* Add/Edit Merchant Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">
              {showAddModal ? 'Add New Merchant' : 'Edit Merchant'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    disabled={showEditModal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    disabled={showEditModal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    value={formData.business_description}
                    onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your business"
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
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter business address"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order (₱)
                    </label>
                    <input
                      type="number"
                      value={formData.minimum_order}
                      onChange={(e) => setFormData({ ...formData, minimum_order: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      value={formData.delivery_radius}
                      onChange={(e) => setFormData({ ...formData, delivery_radius: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Operating Hours
                  </label>
                  <div className="space-y-2">
                    {days.map((day, index) => (
                      <div key={day} className="flex items-center space-x-3">
                        <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                          {dayLabels[index].substring(0, 3)}
                        </div>
                        <input
                          type="checkbox"
                          checked={!formData.operating_hours[day].is_closed}
                          onChange={(e) => setFormData({
                            ...formData,
                            operating_hours: {
                              ...formData.operating_hours,
                              [day]: {
                                ...formData.operating_hours[day],
                                is_closed: !e.target.checked
                              }
                            }
                          })}
                          className="rounded border-gray-300"
                        />
                        <input
                          type="time"
                          value={formData.operating_hours[day].open}
                          onChange={(e) => setFormData({
                            ...formData,
                            operating_hours: {
                              ...formData.operating_hours,
                              [day]: {
                                ...formData.operating_hours[day],
                                open: e.target.value
                              }
                            }
                          })}
                          disabled={formData.operating_hours[day].is_closed}
                          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.operating_hours[day].close}
                          onChange={(e) => setFormData({
                            ...formData,
                            operating_hours: {
                              ...formData.operating_hours,
                              [day]: {
                                ...formData.operating_hours[day],
                                close: e.target.value
                              }
                            }
                          })}
                          disabled={formData.operating_hours[day].is_closed}
                          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                        {formData.operating_hours[day].is_closed && (
                          <span className="text-gray-500 text-sm">Closed</span>
                        )}
                      </div>
                    ))}
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
                onClick={showAddModal ? handleAddMerchant : handleUpdateMerchant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showAddModal ? 'Add Merchant' : 'Update Merchant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Merchant Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="text-gray-900">{selectedMerchant.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Type</label>
                  <p className="text-gray-900 capitalize">{selectedMerchant.business_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedMerchant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedMerchant.phone_number}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{selectedMerchant.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{selectedMerchant.business_description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                  <p className="text-gray-900">{selectedMerchant.commission_rate}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Min Order</label>
                  <p className="text-gray-900">₱{selectedMerchant.minimum_order}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Radius</label>
                  <p className="text-gray-900">{selectedMerchant.delivery_radius}km</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Orders</label>
                  <p className="text-gray-900">{selectedMerchant.total_orders.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                  <p className="text-gray-900">₱{selectedMerchant.total_revenue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <p className="text-gray-900">
                    {selectedMerchant.average_rating > 0 
                      ? `${selectedMerchant.average_rating}★ (${selectedMerchant.rating_count} reviews)`
                      : 'No ratings yet'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Operating Hours</label>
                <div className="grid grid-cols-1 gap-1">
                  {days.map((day, index) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{dayLabels[index]}:</span>
                      <span>
                        {selectedMerchant.operating_hours[day].is_closed
                          ? 'Closed'
                          : `${selectedMerchant.operating_hours[day].open} - ${selectedMerchant.operating_hours[day].close}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMerchant.status)}`}>
                  {selectedMerchant.status}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{format(new Date(selectedMerchant.created_at), 'PPpp')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Document Review Modal */}
      {showDocumentsModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Business Document Review</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Reviewing documents for: <span className="font-medium text-blue-600">{selectedMerchant.business_name}</span>
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
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">Business Application Status</h4>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending Business Review
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">4</div>
                  <div className="text-gray-600">Required Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">3</div>
                  <div className="text-gray-600">Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">1</div>
                  <div className="text-gray-600">Missing</div>
                </div>
              </div>
            </div>

            {/* Business Information Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Business Type:</span> {selectedMerchant.business_type}</div>
                <div><span className="font-medium">Contact Email:</span> {selectedMerchant.users?.email}</div>
                <div><span className="font-medium">Phone Number:</span> {selectedMerchant.users?.phone_number}</div>
                <div><span className="font-medium">Business Address:</span> {selectedMerchant.address}</div>
              </div>
            </div>

            {/* Required Business Documents List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">Required Business Documents</h4>
              
              {[
                { 
                  name: "DTI Certificate", 
                  description: "Department of Trade and Industry business registration",
                  required: true, 
                  submitted: true, 
                  status: "approved",
                  uploadDate: "2024-01-10",
                  notes: "Valid DTI registration, expires 2025",
                  category: "business_license"
                },
                { 
                  name: "Mayor's Permit", 
                  description: "Local government business operating permit",
                  required: true, 
                  submitted: true, 
                  status: "pending",
                  uploadDate: "2024-01-12",
                  notes: "Current permit, needs verification with city hall",
                  category: "business_license"
                },
                { 
                  name: "Business Logo", 
                  description: "High-resolution business logo for app display",
                  required: true, 
                  submitted: true, 
                  status: "approved",
                  uploadDate: "2024-01-11",
                  notes: "PNG format, good quality",
                  category: "branding"
                },
                { 
                  name: "GCash QR Code", 
                  description: "GCash payment QR code for customer payments",
                  required: true, 
                  submitted: false, 
                  status: "missing",
                  uploadDate: null,
                  notes: "Required for payment processing",
                  category: "payment"
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
                      <div>
                        <h5 className="font-medium text-gray-900">{doc.name}</h5>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                      {doc.required && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Required</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.category === 'business_license' ? 'bg-blue-100 text-blue-700' :
                        doc.category === 'branding' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {doc.category === 'business_license' ? 'License' :
                         doc.category === 'branding' ? 'Branding' : 'Payment'}
                      </span>
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
                        doc.status === 'approved' ? 'Verified & Approved' :
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
                      <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                        Download
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

            {/* Business Verification Notes */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">Verification Requirements</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• DTI Certificate must be current and valid</li>
                <li>• Mayor's Permit should match business address</li>
                <li>• GCash QR Code will be verified with test transaction</li>
                <li>• Business Logo must be clear and professional</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Send Message to Merchant
                </button>
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Request Missing Documents
                </button>
                <button className="px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                  Schedule Business Visit
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
                  Approve Business
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
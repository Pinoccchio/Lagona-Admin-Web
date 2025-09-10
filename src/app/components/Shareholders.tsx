'use client'

import { useState, useEffect } from 'react'
import { Shareholder, shareholderService } from '@/services/shareholderService'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function Shareholders() {
  const [shareholders, setShareholders] = useState<Shareholder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDistributeModal, setShowDistributeModal] = useState(false)
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [shareholderToDelete, setShareholderToDelete] = useState<Shareholder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    ownership_percentage: 0,
    initial_investment: 0
  })

  const [distributionData, setDistributionData] = useState({
    totalAmount: 0,
    periodStart: '',
    periodEnd: ''
  })

  useEffect(() => {
    fetchShareholders()
    fetchStatistics()
  }, [])

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const fetchShareholders = async () => {
    try {
      setLoading(true)
      const data = await shareholderService.getAllShareholders()
      setShareholders(data)
    } catch (error) {
      console.error('Error fetching shareholders:', error)
      toast.error('Failed to load shareholders')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const stats = await shareholderService.getShareholderStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleAddShareholder = async () => {
    try {
      await shareholderService.createShareholder(formData)
      showSuccessMessage('Shareholder added successfully!')
      toast.success('Shareholder added successfully')
      setShowAddModal(false)
      resetForm()
      fetchShareholders()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add shareholder')
    }
  }

  const handleUpdateShareholder = async () => {
    if (!selectedShareholder) return
    
    try {
      await shareholderService.updateShareholder(selectedShareholder.id, {
        ownership_percentage: formData.ownership_percentage,
        phone_number: formData.phone_number
      })
      showSuccessMessage('Shareholder updated successfully!')
      toast.success('Shareholder updated successfully')
      setShowEditModal(false)
      resetForm()
      fetchShareholders()
      fetchStatistics()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shareholder')
    }
  }

  const handleDeleteClick = (shareholder: Shareholder) => {
    setShareholderToDelete(shareholder)
    setDeleteError(null)
    setDeleteConfirmationName('')
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!shareholderToDelete) return

    // Check if name confirmation matches
    if (deleteConfirmationName !== shareholderToDelete.full_name) {
      setDeleteError('Please type the exact shareholder name to confirm deletion')
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError(null)
      
      await shareholderService.deleteShareholder(shareholderToDelete.id)
      
      showSuccessMessage('Shareholder removed successfully!')
      toast.success('Shareholder removed successfully')
      setShowDeleteModal(false)
      setShareholderToDelete(null)
      setDeleteConfirmationName('')
      
      fetchShareholders()
      fetchStatistics()
    } catch (error: any) {
      console.error('Error deleting shareholder:', error)
      setDeleteError(error.message || 'Failed to remove shareholder')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setShareholderToDelete(null)
    setDeleteError(null)
    setDeleteConfirmationName('')
  }

  const handleDistributeDividends = async () => {
    try {
      await shareholderService.distributeDividends(
        distributionData.totalAmount,
        {
          start: distributionData.periodStart,
          end: distributionData.periodEnd
        }
      )
      showSuccessMessage('Dividends distributed successfully!')
      toast.success('Dividends distributed successfully')
      setShowDistributeModal(false)
      setDistributionData({ totalAmount: 0, periodStart: '', periodEnd: '' })
      fetchShareholders()
    } catch (error: any) {
      toast.error(error.message || 'Failed to distribute dividends')
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      ownership_percentage: 0,
      initial_investment: 0
    })
    setSelectedShareholder(null)
  }

  const openEditModal = (shareholder: Shareholder) => {
    setSelectedShareholder(shareholder)
    setFormData({
      full_name: shareholder.full_name,
      email: shareholder.email,
      phone_number: shareholder.phone_number || '',
      ownership_percentage: shareholder.ownership_percentage,
      initial_investment: 0
    })
    setShowEditModal(true)
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
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shareholders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.totalShareholders || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.activeShareholders || 0} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ownership</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.totalOwnership || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {statistics?.unallocatedOwnership || 0}% available
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dividends Paid</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱{(statistics?.totalDividendsPaid || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Dividends</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱{(statistics?.totalPendingDividends || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Shareholders</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDistributeModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Distribute Dividends</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={statistics?.unallocatedOwnership === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Shareholder</span>
              </button>
            </div>
          </div>
        </div>

        {/* Shareholders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shareholder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ownership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Dividends
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Dividend
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
              {shareholders.map((shareholder) => (
                <tr key={shareholder.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {shareholder.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{shareholder.email}</div>
                    <div className="text-sm text-gray-500">{shareholder.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {shareholder.ownership_percentage}%
                      </div>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${shareholder.ownership_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{shareholder.total_dividends.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-yellow-600">
                      ₱{shareholder.pending_dividends.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shareholder.last_dividend_date
                      ? format(new Date(shareholder.last_dividend_date), 'MMM dd, yyyy')
                      : 'No dividends yet'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      shareholder.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shareholder.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-y-2">
                      <button
                        onClick={() => openEditModal(shareholder)}
                        className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(shareholder)}
                        className="block w-full text-left text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shareholder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Shareholder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Ownership Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.ownership_percentage}
                  onChange={(e) => setFormData({ ...formData, ownership_percentage: parseFloat(e.target.value) })}
                  max={statistics?.unallocatedOwnership || 100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ownership percentage"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {statistics?.unallocatedOwnership || 0}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Investment (₱)
                </label>
                <input
                  type="number"
                  value={formData.initial_investment}
                  onChange={(e) => setFormData({ ...formData, initial_investment: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter initial investment amount"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddShareholder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Shareholder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shareholder Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Shareholder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  Ownership Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.ownership_percentage}
                  onChange={(e) => setFormData({ ...formData, ownership_percentage: parseFloat(e.target.value) })}
                  max={(statistics?.unallocatedOwnership || 0) + (selectedShareholder?.ownership_percentage || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ownership percentage"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {(statistics?.unallocatedOwnership || 0) + (selectedShareholder?.ownership_percentage || 0)}%
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateShareholder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Shareholder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribute Dividends Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Distribute Dividends</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount to Distribute (₱)
                </label>
                <input
                  type="number"
                  value={distributionData.totalAmount}
                  onChange={(e) => setDistributionData({ ...distributionData, totalAmount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period Start Date
                </label>
                <input
                  type="date"
                  value={distributionData.periodStart}
                  onChange={(e) => setDistributionData({ ...distributionData, periodStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period End Date
                </label>
                <input
                  type="date"
                  value={distributionData.periodEnd}
                  onChange={(e) => setDistributionData({ ...distributionData, periodEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Distribution Preview */}
              {distributionData.totalAmount > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Distribution Preview</h4>
                  <div className="space-y-2">
                    {shareholders
                      .filter(s => s.status === 'active')
                      .map(shareholder => (
                        <div key={shareholder.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{shareholder.full_name} ({shareholder.ownership_percentage}%)</span>
                          <span className="font-medium">
                            ₱{((distributionData.totalAmount * shareholder.ownership_percentage) / 100).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDistributeModal(false)
                  setDistributionData({ totalAmount: 0, periodStart: '', periodEnd: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDistributeDividends}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Distribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && shareholderToDelete && (
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
                  <h2 className="text-2xl font-bold text-gray-900">Delete Shareholder</h2>
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
            
            {/* Shareholder Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{shareholderToDelete.full_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{shareholderToDelete.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Ownership:</span>
                  <span className="text-sm font-semibold text-blue-600">{shareholderToDelete.ownership_percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    shareholderToDelete.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {shareholderToDelete.status.charAt(0).toUpperCase() + shareholderToDelete.status.slice(1)}
                  </span>
                </div>
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
                    <li>• This shareholder will be permanently deleted</li>
                    <li>• All dividend history will be preserved</li>
                    <li>• Ownership percentage will be redistributed</li>
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
                Type <span className="font-bold text-red-600">"{shareholderToDelete.full_name}"</span> to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={shareholderToDelete.full_name}
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
                disabled={isDeleting || deleteConfirmationName !== shareholderToDelete.full_name}
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
                  'Delete Shareholder'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
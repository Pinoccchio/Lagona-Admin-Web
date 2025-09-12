'use client';

import { useState, useEffect } from 'react';
import { businessHubService } from '@/services/businessHubService';
import type { Database } from '@/lib/supabase/types';

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'] & {
  users?: {
    email: string | null;
    phone_number: string | null;
    full_name: string | null;
  } | null;
};

export default function PendingApprovals() {
  const [pendingHubs, setPendingHubs] = useState<BusinessHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Quick action states
  const [processingHubId, setProcessingHubId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hubs = await businessHubService.getBusinessHubsByStatus('pending');
      setPendingHubs(hubs || []);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (hub: BusinessHub) => {
    try {
      setProcessingHubId(hub.id);
      setActionType('approve');
      
      await businessHubService.updateBusinessHubStatus(hub.id, {
        status: 'active',
        reason: 'Quick approval from pending approvals dashboard'
      });

      setSuccessMessage(`${hub.name} has been approved successfully!`);
      await fetchPendingApprovals();
      
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error approving hub:', err);
      setError(err.message || 'Failed to approve business hub');
    } finally {
      setProcessingHubId(null);
      setActionType(null);
    }
  };

  const handleQuickReject = async (hub: BusinessHub) => {
    if (!confirm(`Are you sure you want to reject ${hub.name}? This action requires providing a reason.`)) {
      return;
    }

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      alert('A reason is required for rejection.');
      return;
    }

    try {
      setProcessingHubId(hub.id);
      setActionType('reject');
      
      await businessHubService.updateBusinessHubStatus(hub.id, {
        status: 'rejected',
        reason: reason.trim()
      });

      setSuccessMessage(`${hub.name} has been rejected.`);
      await fetchPendingApprovals();
      
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error rejecting hub:', err);
      setError(err.message || 'Failed to reject business hub');
    } finally {
      setProcessingHubId(null);
      setActionType(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearError = () => setError(null);

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-deep-black">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve new business hub registrations</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchPendingApprovals}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-yellow-800">
              {pendingHubs.length} pending approval{pendingHubs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Approvals Content */}
      <div className="bg-pure-white rounded-xl lagona-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-deep-black">Business Hub Registration Queue</h2>
          <p className="text-sm text-gray-600 mt-1">Review registration details and approve or reject applications</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading pending approvals...</span>
            </div>
          </div>
        ) : pendingHubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-3 bg-green-50 rounded-xl inline-block mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No business hub registrations are pending approval at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingHubs.map((hub) => (
              <div key={hub.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  {/* Hub Information */}
                  <div className="flex-1 space-y-4">
                    {/* Header Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hub.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            BHCODE: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{hub.bhcode}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Submitted: {formatDate(hub.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Location Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Location Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>📍 {hub.municipality}, {hub.province}</div>
                          <div>🏢 Territory: {hub.territory_name || 'Auto-generated'}</div>
                        </div>
                      </div>

                      {/* Manager Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Manager Information</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>👤 {hub.manager_name || 'N/A'}</div>
                          {hub.users?.email && <div>✉️ {hub.users.email}</div>}
                          {hub.users?.phone_number && <div>📱 {hub.users.phone_number}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Financial Info */}
                    {hub.initial_balance && hub.initial_balance > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">
                            Initial Balance: ₱{hub.initial_balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="ml-6 flex flex-col space-y-3">
                    <button
                      onClick={() => handleQuickApprove(hub)}
                      disabled={processingHubId === hub.id}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {processingHubId === hub.id && actionType === 'approve' ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Quick Approve</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleQuickReject(hub)}
                      disabled={processingHubId === hub.id}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {processingHubId === hub.id && actionType === 'reject' ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Reject</span>
                        </>
                      )}
                    </button>

                    <button
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                      onClick={() => {
                        // This could open a detailed review modal in the future
                        alert(`Detailed review for ${hub.name} - Feature coming soon!`);
                      }}
                    >
                      📋 Review Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {pendingHubs.length > 0 && (
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h3 className="text-lg font-semibold text-deep-black mb-4">Approval Queue Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingHubs.length}</div>
              <div className="text-sm text-gray-600">Total Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pendingHubs.filter(h => h.initial_balance && h.initial_balance > 0).length}
              </div>
              <div className="text-sm text-gray-600">With Initial Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₱{pendingHubs.reduce((sum, h) => sum + (h.initial_balance || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Initial Capital</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
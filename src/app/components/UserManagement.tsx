'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'merchant' | 'rider' | 'shareholder';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  documents?: string[];
  joinDate: string;
  location: string;
  businessHub?: string;
  loadingStation?: string;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users: User[] = [
    {
      id: '1',
      name: 'McDonald\'s Ayala',
      email: 'mcdo.ayala@email.com',
      phone: '+63-912-345-6789',
      role: 'merchant',
      status: 'pending',
      documents: ['DTI Certificate', 'Mayor\'s Permit', 'Business Logo'],
      joinDate: '2024-03-15',
      location: 'Ayala Center, Cebu City',
      businessHub: 'Cebu City Hub'
    },
    {
      id: '2',
      name: 'Juan Carlos',
      email: 'juan.carlos@email.com',
      phone: '+63-998-765-4321',
      role: 'rider',
      status: 'pending',
      documents: ['Valid ID', 'Driver\'s License'],
      joinDate: '2024-03-16',
      location: 'Lahug, Cebu City',
      loadingStation: 'Lahug Loading Station'
    },
    {
      id: '3',
      name: 'Maria Santos',
      email: 'maria.santos@investor.com',
      phone: '+63-917-123-4567',
      role: 'shareholder',
      status: 'approved',
      joinDate: '2024-01-10',
      location: 'Manila, NCR'
    },
    {
      id: '4',
      name: 'Jollibee IT Park',
      email: 'jollibee.itpark@email.com',
      phone: '+63-933-456-7890',
      role: 'merchant',
      status: 'approved',
      documents: ['DTI Certificate', 'Mayor\'s Permit', 'Business Logo'],
      joinDate: '2024-02-20',
      location: 'IT Park, Cebu City',
      businessHub: 'Cebu City Hub'
    },
    {
      id: '5',
      name: 'Pedro Gonzales',
      email: 'pedro.gonzales@email.com',
      phone: '+63-905-234-5678',
      role: 'rider',
      status: 'suspended',
      joinDate: '2024-01-25',
      location: 'BGC, Taguig City',
      loadingStation: 'BGC Station'
    }
  ];

  const getFilteredUsers = () => {
    return users.filter(user => {
      if (activeTab === 'all') return true;
      return user.status === activeTab;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'merchant':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
          </svg>
        );
      case 'rider':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        );
      case 'shareholder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleApprove = (userId: string) => {
    console.log('Approving user:', userId);
  };

  const handleReject = (userId: string) => {
    console.log('Rejecting user:', userId);
  };

  const handleViewDocuments = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const tabs = [
    { id: 'pending', label: 'Pending Approval', count: users.filter(u => u.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: users.filter(u => u.status === 'approved').length },
    { id: 'rejected', label: 'Rejected', count: users.filter(u => u.status === 'rejected').length },
    { id: 'suspended', label: 'Suspended', count: users.filter(u => u.status === 'suspended').length },
    { id: 'all', label: 'All Users', count: users.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-black">User Management</h1>
        <p className="text-gray-600 mt-1">Manage merchant, rider, and shareholder registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Users</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {users.filter(u => u.status === 'approved').length}
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
              <p className="text-sm font-medium text-gray-600">Active Merchants</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {users.filter(u => u.role === 'merchant' && u.status === 'approved').length}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Active Riders</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {users.filter(u => u.role === 'rider' && u.status === 'approved').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-pure-white rounded-xl lagona-shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-orange text-primary-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredUsers().map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-deep-black">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">{getRoleIcon(user.role)}</span>
                      <span className="font-medium text-gray-900 capitalize">{user.role}</span>
                    </div>
                    {user.businessHub && (
                      <div className="text-sm text-gray-500">Hub: {user.businessHub}</div>
                    )}
                    {user.loadingStation && (
                      <div className="text-sm text-gray-500">Station: {user.loadingStation}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.joinDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user.documents && (
                        <button
                          onClick={() => handleViewDocuments(user)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Docs
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-700 font-medium text-sm">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Review Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pure-white rounded-xl p-8 max-w-2xl w-full mx-4 lagona-shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-deep-black">
                Document Review - {selectedUser.name}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <span className="ml-2 font-medium capitalize">{selectedUser.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2">{selectedUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2">{selectedUser.location}</span>
                  </div>
                </div>
              </div>

              {selectedUser.documents && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Submitted Documents</h3>
                  <div className="space-y-3">
                    {selectedUser.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span className="font-medium text-gray-900">{doc}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View File
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                {selectedUser.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedUser.id);
                        setShowModal(false);
                      }}
                      className="flex-1 lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
                    >
                      Approve User
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedUser.id);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                    >
                      Reject User
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
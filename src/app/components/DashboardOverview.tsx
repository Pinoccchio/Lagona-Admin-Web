'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analyticsService';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await analyticsService.getDashboardStatistics();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: loading ? '...' : `₱${dashboardStats?.revenue?.total?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        </svg>
      )
    },
    {
      title: 'Active Business Hubs',
      value: loading ? '...' : (dashboardStats?.businessHubs?.active || 0).toString(),
      change: `${dashboardStats?.businessHubs?.total || 0} total`,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
        </svg>
      )
    },
    {
      title: 'Active Loading Stations',
      value: loading ? '...' : (dashboardStats?.loadingStations?.active || 0).toString(),
      change: `${dashboardStats?.loadingStations?.total || 0} total`,
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    },
    {
      title: 'Total Orders',
      value: loading ? '...' : (dashboardStats?.orders?.total || 0).toString(),
      change: `${dashboardStats?.orders?.delivered || 0} delivered`,
      trend: 'up',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
      )
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'hub_created',
      message: 'New Business Hub "Davao City Hub" created',
      time: '2 minutes ago',
      icon: '🏢'
    },
    {
      id: 2,
      type: 'merchant_approved',
      message: 'Merchant "Jollibee Ayala" approved',
      time: '15 minutes ago',
      icon: '✅'
    },
    {
      id: 3,
      type: 'rider_registered',
      message: '5 new riders registered in Cebu Loading Station',
      time: '1 hour ago',
      icon: '🚴'
    },
    {
      id: 4,
      type: 'commission_updated',
      message: 'Commission rates updated for Q4',
      time: '3 hours ago',
      icon: '💰'
    }
  ];

  const commissionData = [
    { name: 'Business Hubs', percentage: 50, amount: `₱${dashboardStats?.businessHubs?.totalRevenue?.toLocaleString() || '0'}`, color: 'bg-orange-500' },
    { name: 'Loading Stations', percentage: 20, amount: `₱${dashboardStats?.loadingStations?.totalRevenue?.toLocaleString() || '0'}`, color: 'bg-yellow-500' },
    { name: 'Riders', percentage: 18, amount: `₱${dashboardStats?.riders?.totalEarnings?.toLocaleString() || '0'}`, color: 'bg-blue-500' },
    { name: 'Platform', percentage: 12, amount: `₱${dashboardStats?.revenue?.platformFees?.toLocaleString() || '0'}`, color: 'bg-green-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative bg-pure-white rounded-2xl p-6 lagona-shadow hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100/50">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-orange/10 to-primary-yellow/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <p className="text-3xl font-black text-deep-black leading-none">{stat.value}</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-bold ${stat.color}`}>{stat.change}</p>
                  <svg className={`w-4 h-4 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Commission Distribution */}
        <div className="lg:col-span-2 bg-pure-white rounded-2xl p-8 lagona-shadow hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Commission Distribution</h2>
              <p className="text-sm text-gray-500 mt-1">Revenue breakdown by stakeholder category</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-primary-orange/10 to-primary-yellow/10 rounded-xl">
              <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>
          
          <div className="space-y-6">
            {commissionData.map((item, index) => (
              <div key={index} className="group p-4 rounded-xl hover:bg-gray-50/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-5 h-5 rounded-lg ${item.color} shadow-md`}></div>
                    <div>
                      <span className="font-bold text-gray-800">{item.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{item.percentage}% share</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-40 bg-gray-200 rounded-full h-3 shadow-inner">
                      <div 
                        className={`h-3 rounded-full ${item.color} shadow-sm transition-all duration-1000 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 w-12 text-center">{item.percentage}%</span>
                    <span className="text-lg font-black text-deep-black w-28 text-right">{item.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t-2 border-gradient-to-r from-primary-orange to-primary-yellow bg-gradient-to-r from-primary-orange/5 to-primary-yellow/5 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-800">Total Revenue</span>
                <p className="text-sm text-gray-500">Current month earnings</p>
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-primary-orange to-primary-yellow bg-clip-text text-transparent">₱2,847,320</span>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activities */}
        <div className="bg-pure-white rounded-2xl p-6 lagona-shadow hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-deep-black">Recent Activities</h2>
              <p className="text-sm text-gray-500">Latest system updates</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-orange/5 hover:to-primary-yellow/5 transition-all duration-200">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-primary-orange/20 group-hover:to-primary-yellow/20 transition-all duration-200">
                  <span className="text-xl">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {activity.time}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-4 h-4 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 bg-gradient-to-r from-primary-orange/10 to-primary-yellow/10 text-primary-orange hover:from-primary-orange/20 hover:to-primary-yellow/20 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg border border-primary-orange/20">
            View all activities →
          </button>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Quick Actions Card */}
        <div className="bg-pure-white rounded-2xl p-6 lagona-shadow hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-primary-orange/10 to-primary-yellow/10 rounded-lg mr-3">
              <svg className="w-5 h-5 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-deep-black">Quick Actions</h3>
              <p className="text-xs text-gray-500">Administrative shortcuts</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="group w-full lagona-gradient text-pure-white py-4 rounded-xl font-bold lagona-hover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Create Business Hub</span>
              </div>
            </button>
            <button className="group w-full bg-gray-50 hover:bg-gradient-to-r hover:from-primary-orange/10 hover:to-primary-yellow/10 text-gray-700 hover:text-gray-800 py-4 rounded-xl font-semibold transition-all duration-300 border border-gray-200 hover:border-primary-orange/30">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Approve Pending Users</span>
              </div>
            </button>
            <button className="group w-full bg-gray-50 hover:bg-gradient-to-r hover:from-primary-orange/10 hover:to-primary-yellow/10 text-gray-700 hover:text-gray-800 py-4 rounded-xl font-semibold transition-all duration-300 border border-gray-200 hover:border-primary-orange/30">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span>Update Commission Rates</span>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced System Health */}
        <div className="bg-pure-white rounded-2xl p-6 lagona-shadow hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-deep-black">System Health</h3>
              <p className="text-xs text-gray-500">Real-time monitoring</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Server Status</span>
              <span className="flex items-center text-sm font-bold text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse shadow-sm"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Database</span>
              <span className="flex items-center text-sm font-bold text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse shadow-sm"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Payment System</span>
              <span className="flex items-center text-sm font-bold text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse shadow-sm"></div>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">API Status</span>
              <span className="flex items-center text-sm font-bold text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse shadow-sm"></div>
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Platform Metrics */}
        <div className="bg-pure-white rounded-2xl p-6 lagona-shadow hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-deep-black">Platform Metrics</h3>
              <p className="text-xs text-gray-500">Key performance indicators</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50/30 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active Users</span>
              <span className="text-lg font-black text-deep-black">8,247</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50/30 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Pending Approvals</span>
              <span className="text-lg font-black text-orange-600">23</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50/30 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Monthly Growth</span>
              <span className="text-lg font-black text-green-600">+15.3%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Avg. Delivery Time</span>
              <span className="text-lg font-black text-deep-black">32 mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
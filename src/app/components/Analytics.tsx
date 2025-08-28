'use client';

import { useState } from 'react';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7days');

  const revenueData = [
    { period: 'Jan', revenue: 2400000, orders: 1200, users: 150 },
    { period: 'Feb', revenue: 2600000, orders: 1350, users: 180 },
    { period: 'Mar', revenue: 2847320, orders: 1247, users: 210 },
    { period: 'Apr', revenue: 3100000, orders: 1400, users: 240 },
    { period: 'May', revenue: 3350000, orders: 1520, users: 280 },
    { period: 'Jun', revenue: 3200000, orders: 1380, users: 290 }
  ];

  const topPerformers = {
    hubs: [
      { name: 'Manila Hub', revenue: '₱1,245,800', orders: 2847, growth: '+15.2%' },
      { name: 'Cebu City Hub', revenue: '₱847,320', orders: 1923, growth: '+12.8%' },
      { name: 'Davao City Hub', revenue: '₱523,150', orders: 1184, growth: '+18.5%' }
    ],
    stations: [
      { name: 'BGC Station', revenue: '₱198,750', orders: 425, growth: '+22.1%' },
      { name: 'Ayala Station', revenue: '₱145,680', orders: 387, growth: '+16.4%' },
      { name: 'IT Park Station', revenue: '₱112,450', orders: 295, growth: '+14.7%' }
    ],
    merchants: [
      { name: 'Jollibee IT Park', revenue: '₱89,420', orders: 234, rating: 4.8 },
      { name: 'McDonald\'s Ayala', revenue: '₱76,350', orders: 198, rating: 4.6 },
      { name: 'KFC BGC', revenue: '₱65,280', orders: 167, rating: 4.7 }
    ]
  };

  const platformMetrics = {
    totalUsers: 8247,
    activeUsers: 6892,
    newUsers: 234,
    retentionRate: 78.5,
    avgOrderValue: 485,
    avgDeliveryTime: 32,
    customerSatisfaction: 4.6,
    riderUtilization: 72.3
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-deep-black">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Platform performance metrics and business intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="lagona-gradient text-pure-white px-6 py-2 rounded-lg font-semibold lagona-hover lagona-shadow">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₱2.85M</p>
              <p className="text-sm text-green-600 mt-1">+12.5% vs last month</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders Today</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">1,247</p>
              <p className="text-sm text-blue-600 mt-1">+8.2% vs yesterday</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{platformMetrics.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">{platformMetrics.newUsers} new today</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{platformMetrics.avgDeliveryTime}min</p>
              <p className="text-sm text-orange-600 mt-1">-3min vs last week</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-xl font-semibold text-deep-black mb-6">Revenue Trend (6 Months)</h2>
          <div className="space-y-4">
            {revenueData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-12 text-sm font-medium text-gray-600">{item.period}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 w-32">
                    <div 
                      className="h-3 rounded-full lagona-gradient"
                      style={{ width: `${(item.revenue / 3500000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-deep-black">
                    ₱{(item.revenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-gray-500">{item.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-xl font-semibold text-deep-black mb-6">Platform Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Retention Rate</span>
              <span className="text-sm font-semibold text-green-600">{platformMetrics.retentionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Order Value</span>
              <span className="text-sm font-semibold text-deep-black">₱{platformMetrics.avgOrderValue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-semibold text-yellow-600">{platformMetrics.customerSatisfaction}⭐</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rider Utilization</span>
              <span className="text-sm font-semibold text-blue-600">{platformMetrics.riderUtilization}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Business Hubs */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-lg font-semibold text-deep-black mb-4">Top Business Hubs</h2>
          <div className="space-y-4">
            {topPerformers.hubs.map((hub, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{hub.name}</div>
                  <div className="text-sm text-gray-500">{hub.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{hub.revenue}</div>
                  <div className="text-sm text-green-600">{hub.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Loading Stations */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-lg font-semibold text-deep-black mb-4">Top Loading Stations</h2>
          <div className="space-y-4">
            {topPerformers.stations.map((station, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{station.name}</div>
                  <div className="text-sm text-gray-500">{station.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{station.revenue}</div>
                  <div className="text-sm text-green-600">{station.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Merchants */}
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <h2 className="text-lg font-semibold text-deep-black mb-4">Top Merchants</h2>
          <div className="space-y-4">
            {topPerformers.merchants.map((merchant, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{merchant.name}</div>
                  <div className="text-sm text-gray-500">{merchant.orders} orders • {merchant.rating}⭐</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{merchant.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Analysis */}
      <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
        <h2 className="text-xl font-semibold text-deep-black mb-6">Commission Distribution Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 lagona-gradient rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-pure-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-deep-black">₱1.42M</div>
            <div className="text-sm text-gray-600">Business Hubs (50%)</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-pure-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-deep-black">₱569K</div>
            <div className="text-sm text-gray-600">Loading Stations (20%)</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-pure-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-deep-black">₱513K</div>
            <div className="text-sm text-gray-600">Riders (18%)</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-pure-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-deep-black">₱342K</div>
            <div className="text-sm text-gray-600">Platform (12%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
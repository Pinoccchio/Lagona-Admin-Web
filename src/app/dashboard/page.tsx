'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import BusinessHubs from '../components/BusinessHubs';
import LoadingStations from '../components/LoadingStations';
import UserManagement from '../components/UserManagement';
import SystemConfig from '../components/SystemConfig';
import Analytics from '../components/Analytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'business-hubs': return 'Business Hubs Management';
      case 'loading-stations': return 'Loading Stations';
      case 'user-management': return 'User Management';
      case 'system-config': return 'System Configuration';
      case 'analytics': return 'Analytics & Reports';
      default: return 'Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'overview': return 'Platform performance and key metrics overview';
      case 'business-hubs': return 'Manage municipality and city level operations';
      case 'loading-stations': return 'Oversee area-level delivery stations';
      case 'user-management': return 'Handle user registrations and approvals';
      case 'system-config': return 'Configure platform settings and parameters';
      case 'analytics': return 'Comprehensive reports and business intelligence';
      default: return 'LAGONA administrative dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'business-hubs':
        return <BusinessHubs />;
      case 'loading-stations':
        return <LoadingStations />;
      case 'user-management':
        return <UserManagement />;
      case 'system-config':
        return <SystemConfig />;
      case 'analytics':
        return <Analytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="group p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
                
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {getPageDescription()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* System Status */}
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-green-50/80 rounded-full border border-green-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">System Online</span>
                </div>
                
                {/* Current Time */}
                <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="font-medium">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                
                {/* Admin Profile */}
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold text-gray-900">Welcome back</div>
                    <div className="text-xs text-gray-600">Admin User</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      A
                    </div>
                    
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="group relative overflow-hidden bg-gradient-to-r from-primary-orange to-primary-yellow text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-200/50"
                    >
                      <span className="relative z-10 text-sm">Logout</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-yellow to-primary-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
              <span className="text-primary-orange font-medium">LAGONA</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
              <span className="text-gray-600 font-medium">Admin Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
              <span className="text-gray-900 font-semibold">{getPageTitle()}</span>
            </div>
          </div>
        </header>
        
        {/* Enhanced Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
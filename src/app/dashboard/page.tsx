'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import Shareholders from '../components/Shareholders';
import BusinessHubs from '../components/BusinessHubs';
import LoadingStations from '../components/LoadingStations';
import Merchants from '../components/Merchants';
import Riders from '../components/Riders';
import SystemConfig from '../components/SystemConfig';
import Analytics from '../components/Analytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // CLIENT-SIDE ROUTE PROTECTION - Simple and reliable
  useEffect(() => {
    if (!loading && !user) {
      console.log('[Dashboard] No user, redirecting to login')
      router.replace('/')
    }
  }, [user, loading, router])

  // Timer for current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse mb-4 mx-auto">
            L
          </div>
          <p className="text-gray-600 font-medium">Loading LAGONA Dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null // Will redirect via useEffect above
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);
      console.log('[Dashboard] Starting logout...');
      
      // Simple client-side logout
      await signOut();
      console.log('[Dashboard] Logout completed');
      
      // Redirect immediately - no need for server coordination
      router.replace('/');
      
    } catch (error) {
      console.error('[Dashboard] Logout error:', error);
      setLogoutError('Logout failed. Please try again.');
      setIsLoggingOut(false);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'shareholders': return 'Shareholders Management';
      case 'business-hubs': return 'Business Hubs Management';
      case 'loading-stations': return 'Loading Stations';
      case 'merchants': return 'Merchants Management';
      case 'riders': return 'Riders Management';
      case 'system-config': return 'System Configuration';
      case 'analytics': return 'Analytics & Reports';
      default: return 'Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'overview': return 'Platform performance and key metrics overview';
      case 'shareholders': return 'Manage company shareholders and dividend distributions';
      case 'business-hubs': return 'Manage municipality and city level operations';
      case 'loading-stations': return 'Oversee area-level delivery stations';
      case 'merchants': return 'Handle merchant registrations and business partnerships';
      case 'riders': return 'Manage delivery personnel and rider operations';
      case 'system-config': return 'Configure platform settings and parameters';
      case 'analytics': return 'Comprehensive reports and business intelligence';
      default: return 'LAGONA administrative dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'shareholders':
        return <Shareholders />;
      case 'business-hubs':
        return <BusinessHubs />;
      case 'loading-stations':
        return <LoadingStations />;
      case 'merchants':
        return <Merchants />;
      case 'riders':
        return <Riders />;
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
                    <div className="text-xs text-gray-600">{profile?.full_name || 'Admin User'}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`group relative overflow-hidden bg-gradient-to-r from-primary-orange to-primary-yellow text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-200/50 ${
                        isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="relative z-10 text-sm">
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-yellow to-primary-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                  
                  {/* Logout Error Display */}
                  {logoutError && (
                    <div className="absolute top-16 right-0 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg shadow-lg max-w-sm z-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{logoutError}</span>
                        <button 
                          onClick={() => setLogoutError(null)}
                          className="ml-3 text-red-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
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
          <div className="p-6 md:p-8 min-h-screen">
            <div className="max-w-full">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
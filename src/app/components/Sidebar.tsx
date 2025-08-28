'use client';

import Image from 'next/image';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, collapsed }: SidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"/>
        </svg>
      )
    },
    {
      id: 'business-hubs',
      label: 'Business Hubs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
        </svg>
      )
    },
    {
      id: 'loading-stations',
      label: 'Loading Stations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
        </svg>
      )
    },
    {
      id: 'system-config',
      label: 'System Config',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      )
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-pure-white transition-all duration-500 ease-in-out z-30 border-r border-gray-700/50 lagona-shadow ${collapsed ? 'w-20' : 'w-80'}`}>
      {/* Enhanced Logo Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center p-4' : 'p-8'} border-b border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm`}>
        <div className="relative">
          <Image
            src="/logos/logo_withbg.jpeg"
            alt="LAGONA"
            width={collapsed ? 40 : 50}
            height={collapsed ? 40 : 50}
            className={`rounded-xl ring-2 ring-primary-orange/30 shadow-lg transition-all duration-300 ${collapsed ? 'h-10 w-10' : 'h-12 w-12'}`}
          />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-xl opacity-20 blur animate-pulse"></div>
        </div>
        {!collapsed && (
          <div className="ml-4 space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-orange via-primary-yellow to-primary-orange bg-clip-text text-transparent">
              LAGONA
            </h1>
            <p className="text-sm font-medium text-gray-300">Administrative Portal</p>
          </div>
        )}
      </div>

      {/* Enhanced Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group w-full flex items-center ${collapsed ? 'justify-center px-3 py-4' : 'px-4 py-4'} text-left rounded-xl transition-all duration-300 hover:scale-105 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-primary-orange to-primary-yellow text-deep-black shadow-lg shadow-orange-500/25' 
                  : 'hover:bg-gray-800/60 hover:shadow-md hover:shadow-gray-600/10'
              }`}
            >
              <span className={`transition-colors duration-300 ${
                activeTab === item.id ? 'text-deep-black' : 'text-gray-300 group-hover:text-primary-orange'
              }`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className={`ml-4 font-semibold text-sm transition-colors duration-300 ${
                  activeTab === item.id ? 'text-deep-black' : 'text-gray-200 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              )}
              {activeTab === item.id && !collapsed && (
                <div className="ml-auto w-1 h-6 bg-deep-black rounded-full opacity-50"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Enhanced Bottom Section */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl p-5 border border-gray-600/30 lagona-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-primary-orange">System Status</h3>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Server</span>
                <span className="text-green-400 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Database</span>
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">API</span>
                <span className="text-green-400 font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
        </div>
      )}
    </div>
  );
}
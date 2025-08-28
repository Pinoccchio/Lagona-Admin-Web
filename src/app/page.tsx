'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - redirect to dashboard
    window.location.href = '/dashboard';
  };

  const features = [
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
        </svg>
      ),
      title: "Entity Management",
      description: "Comprehensive management of Business Hubs, Loading Stations, and hierarchical user systems across multiple territories",
      features: ["Business Hub Creation", "Territory Management", "User Hierarchies", "Code Generation (BHCODE/LSCODE)"]
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
      title: "Advanced Analytics",
      description: "Real-time revenue tracking, commission distribution analytics, and comprehensive platform performance monitoring",
      features: ["Revenue Tracking", "Performance Metrics", "User Analytics", "Commission Reports"]
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
      title: "System Configuration",
      description: "Dynamic commission rate management, delivery pricing controls, and comprehensive platform-wide parameter configuration",
      features: ["Commission Settings", "Pricing Control", "User Approvals", "System Parameters"]
    }
  ];

  const commissionData = [
    { percentage: 50, label: "Business Hub", color: "from-orange-400 to-orange-500", amount: "₱1.42M" },
    { percentage: 20, label: "Loading Station", color: "from-yellow-400 to-yellow-500", amount: "₱569K" },
    { percentage: 18, label: "Rider", color: "from-blue-400 to-blue-500", amount: "₱513K" },
    { percentage: 12, label: "Platform", color: "from-green-400 to-green-500", amount: "₱342K" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Modern Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src="/logos/logo_nobg.png"
                  alt="LAGONA Logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-full opacity-20 blur-sm animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-yellow bg-clip-text text-transparent">
                  LAGONA
                </h1>
                <p className="text-sm text-gray-600 font-medium">Admin Portal</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-primary-orange to-primary-yellow text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-200/50"
            >
              <span className="relative z-10">Admin Access</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-yellow to-primary-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-primary-orange/20 to-primary-yellow/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-primary-yellow/15 to-primary-orange/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-orange/10 to-primary-yellow/10 rounded-full border border-primary-orange/20">
                  <span className="w-2 h-2 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-full animate-pulse mr-3"></span>
                  <span className="text-sm font-medium text-gray-700">Multi-Platform Delivery Ecosystem</span>
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Welcome to{' '}
                  <span className="bg-gradient-to-r from-primary-orange via-primary-yellow to-primary-orange bg-clip-text text-transparent">
                    LAGONA
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Advanced administrative dashboard for comprehensive delivery ecosystem management with hierarchical commission distribution and real-time territorial oversight.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-orange to-primary-yellow text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Access Dashboard
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </span>
                </button>
                
                <div className="flex items-center text-gray-600">
                  <div className="flex -space-x-2 mr-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium">8,247+ Active Users</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                  <Image
                    src="/logos/logo_withbg.jpeg"
                    alt="LAGONA Platform"
                    width={200}
                    height={200}
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    LIVE
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-8 -left-8 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float">
                <div className="text-2xl font-bold text-gray-900">₱2.85M</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '-2s' }}>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-600">Orders Today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Platform Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools and analytics for complete ecosystem oversight and optimization
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                </div>
                
                <ul className="space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-primary-orange to-primary-yellow rounded-full mr-3"></div>
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Display */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real-Time Commission Distribution
            </h2>
            <p className="text-xl text-gray-600">
              Transparent revenue sharing across the entire delivery ecosystem
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {commissionData.map((item, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className={`h-2 bg-gradient-to-r ${item.color} rounded-full mb-4`}></div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{item.percentage}%</div>
                  <div className="text-sm font-medium text-gray-600 mb-2">{item.label}</div>
                  <div className="text-lg font-bold text-green-600">{item.amount}</div>
                  <div className="text-xs text-gray-500 mt-2">Monthly Revenue</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Base Delivery Fee</div>
                  <div className="text-2xl font-bold text-gray-900">₱65 + ₱10/km</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Platform Revenue</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-orange to-primary-yellow bg-clip-text text-transparent">₱2,847,320</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 transform animate-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
                <p className="text-gray-600 mt-1">Access your LAGONA dashboard</p>
              </div>
              <button 
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Email Address</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                  placeholder="admin@lagona.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                  placeholder="••••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-orange to-primary-yellow text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 hover:scale-[1.02]"
              >
                Access Admin Dashboard
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
              <div className="text-center text-sm text-gray-600">
                <strong>Demo Credentials:</strong><br />
                admin@lagona.com / admin123
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <Image
                  src="/logos/logo_withbg.jpeg"
                  alt="LAGONA"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-orange to-primary-yellow bg-clip-text text-transparent">LAGONA</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced multi-platform delivery ecosystem management with hierarchical commission distribution and territorial oversight.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Entity Management</li>
                <li>Real-time Analytics</li>
                <li>Commission Distribution</li>
                <li>System Configuration</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-400">All Systems Operational</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-400">8,247 Active Users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-400">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 LAGONA. Multi-Platform Delivery Ecosystem Management.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Version 2.1.0</span>
              <span className="text-gray-400 text-sm">Admin Portal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

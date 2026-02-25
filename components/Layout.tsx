'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠', color: 'from-blue-500 to-indigo-600', description: 'Overview & Analytics' },
  { name: 'Companies', href: '/companies', icon: '🏢', color: 'from-emerald-500 to-teal-600', description: 'Browse & Analyze' },
  { name: 'Lists', href: '/lists', icon: '📋', color: 'from-purple-500 to-pink-600', description: 'Manage Collections' },
  { name: 'Saved', href: '/saved', icon: '💾', color: 'from-orange-500 to-red-600', description: 'Saved Searches' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 lg:w-72 glass z-50
        flex flex-col h-full border-r border-white/20
      `}>
        {/* Logo/App Title */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg animate-glow">
              <span className="text-white font-bold text-lg">VC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Intelligence</h1>
              <p className="text-xs text-gray-500 font-medium">AI Platform</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Header */}
        <div className="px-6 py-3 border-b border-white/10">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Navigation</h2>
        </div>
        
        {/* Premium Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                        : 'text-gray-700 hover:text-black hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-bold text-gradient">VC</span>
                <span className="text-sm text-gray-500">Intelligence</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">System Active</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">© 2026 All rights reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Premium Header */}
        <header className="glass border-b border-white/20 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Premium Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search companies, lists, or insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded-md">⌘K</kbd>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fadeIn min-h-screen">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="glass border-t border-white/20 p-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-gradient">VC</span>
              <span className="text-sm text-gray-500">Intelligence Platform</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">© 2026 VC Intelligence. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

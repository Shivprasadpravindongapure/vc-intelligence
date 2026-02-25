'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠', color: 'from-slate-600 to-slate-700', description: 'Overview & Analytics' },
  { name: 'Companies', href: '/companies', icon: '🏢', color: 'from-blue-600 to-blue-700', description: 'Browse & Analyze' },
  { name: 'Lists', href: '/lists', icon: '📋', color: 'from-purple-600 to-purple-700', description: 'Manage Collections' },
  { name: 'Saved', href: '/saved', icon: '💾', color: 'from-emerald-600 to-emerald-700', description: 'Saved Searches' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

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
        w-64 lg:w-72 bg-slate-800/90 backdrop-blur-sm border-r border-slate-700/50 z-50 flex flex-col h-full
      `}>
        {/* Logo/App Title */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg border border-slate-600">
              <span className="text-white font-bold text-lg">VC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Intelligence</h1>
              <p className="text-xs text-slate-400 font-medium">Smart Analysis</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Header */}
        <div className="px-6 py-3 border-b border-slate-700/50">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</h2>
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
                        : 'text-slate-600 hover:text-white hover:bg-slate-700/50'
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
        <div className="p-4 border-t border-slate-700/50">
          <div className="px-4 py-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-bold text-white">VC</span>
                <span className="text-sm text-slate-400">Intelligence</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">System Active</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">© 2026 All rights reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Premium Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fadeIn min-h-full">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 p-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-bold text-white">VC</span>
              <span className="text-sm text-slate-400">Intelligence Platform</span>
            </div>
            <p className="text-xs text-slate-500">© 2026 VC Intelligence. All rights reserved.</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">System Active</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

import Layout from '@/components/Layout';
import Link from 'next/link';

const features = [
  {
    name: 'AI-Powered Analysis',
    description: 'Get comprehensive company insights powered by advanced artificial intelligence',
    icon: '🤖',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Smart Search',
    description: 'Find companies quickly with intelligent search and filtering capabilities',
    icon: '🔍',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    name: 'List Management',
    description: 'Organize and manage your investment portfolios with custom lists',
    icon: '📋',
    color: 'from-purple-500 to-pink-600'
  },
  {
    name: 'Real-time Data',
    description: 'Access up-to-date information with intelligent caching system',
    icon: '📊',
    color: 'from-orange-500 to-red-600'
  },
  {
    name: 'Rich Analytics',
    description: 'Deep insights with keywords, signals, and growth indicators',
    icon: '📈',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    name: 'Secure Platform',
    description: 'Enterprise-grade security with local data storage',
    icon: '🔒',
    color: 'from-indigo-500 to-purple-600'
  }
];

const stats = [
  { label: 'Companies Analyzed', value: '15K+' },
  { label: 'AI Insights', value: '50K+' },
  { label: 'Data Points', value: '100K+' },
  { label: 'Success Rate', value: '98%' }
];

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800/10 to-purple-800/10 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-700/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-32 w-64 h-64 bg-indigo-700/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 py-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm tracking-wide">AI-POWERED INTELLIGENCE</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block mb-2">VC Intelligence</span>
              <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Smart Investment Analysis
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Transform your investment strategy with AI-powered company analysis and intelligent market insights
            </p>

            {/* CTA Button */}
            <Link href="/companies">
              <button className="group relative inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <span className="relative z-10">Start Exploring</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5M5 7l5 5" />
                </svg>
              </button>
            </Link>
          </div>

          {/* Navigation Arrow */}
          <div className="absolute top-8 left-8 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 animate-pulse">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white text-xs font-medium">Navigate</span>
          </div>
        </section>

      </div>
    </Layout>
  );
}

        

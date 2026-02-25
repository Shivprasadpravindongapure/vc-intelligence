'use client';

import { useState } from 'react';

interface EnrichmentData {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: string[];
  sources: { url: string; timestamp: string }[];
  enrichedAt: string;
  companyDetails?: {
    founded?: string;
    employees?: string;
    netWorth?: string;
    founders?: string[];
    headquarters?: string;
    revenue?: string;
    funding?: string;
  };
  error?: string;
}

interface EnrichmentPanelProps {
  companyUrl: string;
  onAddToList?: () => void;
}

export default function EnrichmentPanel({ companyUrl, onAddToList }: EnrichmentPanelProps) {
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check cache first
  const getCachedEnrichment = (url: string): EnrichmentData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cacheKey = `enrichment-${url}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 24 hours old
        const cacheAge = Date.now() - new Date(parsed.enrichedAt).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          return parsed;
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  // Save to cache
  const cacheEnrichment = (url: string, data: EnrichmentData) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheKey = `enrichment-${url}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  const handleEnrich = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check cache first
      const cached = getCachedEnrichment(companyUrl);
      if (cached) {
        setEnrichment(cached);
        setIsExpanded(true);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: companyUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enrich company data');
      }

      const data: EnrichmentData = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setEnrichment(data);
      cacheEnrichment(companyUrl, data);
      setIsExpanded(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Enrichment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportData = () => {
    if (!enrichment) return;
    
    const exportData = {
      companyUrl,
      enrichedAt: enrichment.enrichedAt,
      summary: enrichment.summary,
      whatTheyDo: enrichment.whatTheyDo,
      keywords: enrichment.keywords,
      signals: enrichment.signals,
      companyDetails: enrichment.companyDetails,
      sources: enrichment.sources,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `company-enrichment-${companyUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/70 to-slate-800/70">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Company Intelligence Dashboard
            </h3>
            <div className="text-slate-400 text-sm">
              {enrichment ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="font-medium">Analysis completed • {formatDate(enrichment.enrichedAt)}</span>
                </div>
              ) : (
                <span className="font-medium">AI-powered company analysis and insights</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-all duration-200 hover:scale-105"
          >
            <svg 
              className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/40 to-slate-700/40">
        <div className="flex items-center gap-4">
          <button
            onClick={handleEnrich}
            disabled={loading}
            className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              loading 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : enrichment ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Update Analysis</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Start Analysis</span>
              </div>
            )}
          </button>
          {enrichment && (
            <button
              onClick={handleExportData}
              className="px-6 py-4 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 text-blue-300 rounded-xl font-semibold hover:from-blue-600/70 hover:to-indigo-600/70 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/25"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </div>
            </button>
          )}
          {onAddToList && (
            <button
              onClick={onAddToList}
              className="px-6 py-4 bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-purple-300 rounded-xl font-semibold hover:from-purple-600/70 hover:to-pink-600/70 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/25"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save to List</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-300 font-medium">Analysis Failed</h4>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {enrichment && isExpanded && (
        <div className="divide-y divide-slate-700/50">
          {/* Summary Section */}
          <div className="p-8 bg-gradient-to-br from-slate-800/30 to-slate-700/30">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              SUMMARY
            </h4>
            <p className="text-slate-200 leading-relaxed text-lg">{enrichment.summary}</p>
          </div>

          {/* Company Details Section */}
          {enrichment.companyDetails && (
            <div className="p-8 bg-gradient-to-br from-slate-800/20 to-slate-700/20">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Company Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Founded */}
                {enrichment.companyDetails.founded && enrichment.companyDetails.founded !== 'Unknown' && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-semibold text-blue-300">Founded</h5>
                    </div>
                    <p className="text-slate-200 font-medium">{enrichment.companyDetails.founded}</p>
                  </div>
                )}

                {/* Employees */}
                {enrichment.companyDetails.employees && enrichment.companyDetails.employees !== 'Unknown' && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-semibold text-emerald-300">Employees</h5>
                    </div>
                    <p className="text-slate-200 font-medium">{enrichment.companyDetails.employees}</p>
                  </div>
                )}

                {/* Net Worth */}
                {enrichment.companyDetails.netWorth && enrichment.companyDetails.netWorth !== 'Unknown' && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-semibold text-yellow-300">Valuation</h5>
                    </div>
                    <p className="text-slate-200 font-medium">{enrichment.companyDetails.netWorth}</p>
                  </div>
                )}

                {/* Headquarters */}
                {enrichment.companyDetails.headquarters && enrichment.companyDetails.headquarters !== 'Unknown' && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-semibold text-purple-300">Headquarters</h5>
                    </div>
                    <p className="text-slate-200 font-medium">{enrichment.companyDetails.headquarters}</p>
                  </div>
                )}

                {/* Revenue */}
                {enrichment.companyDetails.revenue && enrichment.companyDetails.revenue !== 'Unknown' && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-semibold text-green-300">Revenue</h5>
                    </div>
                    <p className="text-slate-200 font-medium">{enrichment.companyDetails.revenue}</p>
                  </div>
                )}

                {/* Funding */}
                {enrichment.companyDetails.funding && enrichment.companyDetails.funding !== 'Unknown' && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-semibold text-indigo-300">Funding</h5>
                    </div>
                    <p className="text-slate-200 font-medium">{enrichment.companyDetails.funding}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Founders Section */}
          {enrichment.companyDetails?.founders && enrichment.companyDetails.founders.length > 0 && enrichment.companyDetails.founders[0] !== 'Unknown' && (
            <div className="p-8 bg-gradient-to-br from-slate-800/25 to-slate-700/25">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Founders
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrichment.companyDetails.founders.map((founder, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium">{founder}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What They Do Section */}
          {enrichment.whatTheyDo.length > 0 && (
            <div className="p-8 bg-gradient-to-br from-slate-800/30 to-slate-700/30">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                WHAT THEY DO
              </h4>
              <div className="space-y-3">
                {enrichment.whatTheyDo.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/20 rounded-lg p-3 border border-slate-600/30">
                    <div className="w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-200 leading-relaxed">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Information */}
          <div className="p-8 bg-gradient-to-br from-slate-800/25 to-slate-700/25">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Keywords */}
              {enrichment.keywords.length > 0 && (
                <div>
                  <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    Keywords
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {enrichment.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-rose-600/20 text-pink-300 rounded-lg text-sm border border-pink-600/30 font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Signals */}
              {enrichment.signals.length > 0 && (
                <div>
                  <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    DERIVED SIGNALS
                  </h5>
                  <div className="space-y-3">
                    {enrichment.signals.map((signal, index) => (
                      <div key={index} className="flex items-center gap-3 bg-slate-700/20 rounded-lg p-3 border border-slate-600/30">
                        <div className="w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex-shrink-0 shadow-lg shadow-amber-400/50" />
                        <span className="text-slate-200 text-sm font-medium">{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Sources */}
          {enrichment.sources.length > 0 && (
            <div className="p-8 bg-gradient-to-br from-slate-800/30 to-slate-700/30">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                Data Sources
              </h4>
              <div className="space-y-3">
                {enrichment.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {source.url.replace('https://', '').replace('http://', '')}
                    </a>
                    <span className="text-slate-500 text-xs font-medium">
                      {formatDate(source.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                <span className="text-slate-400 font-medium">Analysis completed: {formatDate(enrichment.enrichedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                <span className="text-slate-400 font-medium">Data verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

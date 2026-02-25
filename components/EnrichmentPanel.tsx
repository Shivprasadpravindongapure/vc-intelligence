'use client';

import { useState } from 'react';

interface EnrichmentData {
  summary: string;
  whatTheyDo: string[]; // Changed to array for bullet points
  keywords: string[];
  signals: string[];
  sources: { url: string; timestamp: string }[]; // Changed to object array with timestamps
  enrichedAt: string; // Renamed from timestamp
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
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Company Intelligence
            </h3>
            <div className="text-slate-400 text-sm">
              {enrichment ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span>Analysis completed • {formatDate(enrichment.enrichedAt)}</span>
                </div>
              ) : (
                'AI-powered company analysis and insights'
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-all duration-200"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
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
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <button
            onClick={handleEnrich}
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              loading 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-600 text-white hover:bg-slate-500'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : enrichment ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Update Analysis</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Start Analysis</span>
              </div>
            )}
          </button>
          {enrichment && (
            <button
              onClick={handleExportData}
              className="px-6 py-3 bg-emerald-600/50 text-emerald-300 rounded-lg font-medium hover:bg-emerald-600/70 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </div>
            </button>
          )}
          {onAddToList && (
            <button
              onClick={onAddToList}
              className="px-6 py-3 bg-slate-600/50 text-slate-300 rounded-lg font-medium hover:bg-slate-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {/* Overview Section */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Overview</h4>
            <p className="text-slate-300 leading-relaxed">{enrichment.summary}</p>
          </div>

          {/* Business Activities */}
          {enrichment.whatTheyDo.length > 0 && (
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Business Activities</h4>
              <div className="grid grid-cols-1 gap-3">
                {enrichment.whatTheyDo.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords */}
              {enrichment.keywords.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-3">Keywords</h5>
                  <div className="flex flex-wrap gap-2">
                    {enrichment.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs border border-slate-600/50"
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
                  <h5 className="text-sm font-semibold text-white mb-3">Market Signals</h5>
                  <div className="space-y-2">
                    {enrichment.signals.map((signal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                        <span className="text-slate-300 text-xs">{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Sources */}
          {enrichment.sources.length > 0 && (
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Data Sources</h4>
              <div className="space-y-2">
                {enrichment.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                      {source.url.replace('https://', '').replace('http://', '')}
                    </a>
                    <span className="text-slate-500 text-xs">
                      {formatDate(source.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 bg-slate-900/30">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Analysis completed: {formatDate(enrichment.enrichedAt)}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Data verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

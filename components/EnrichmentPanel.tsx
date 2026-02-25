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

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/20 shadow-premium">
      {/* Premium Header */}
      <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              AI Enrichment
            </h3>
            <p className="text-gray-600 font-medium">
              {enrichment ? (
                <span className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last updated: {formatDate(enrichment.enrichedAt)}
                  </span>
                </span>
              ) : (
                'Get AI-powered insights about this company'
              )}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-4 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-all duration-200 hover:scale-110"
          >
            <svg 
              className={`w-7 h-7 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="p-8 border-b border-white/10">
        <div className="flex gap-6">
          <button
            onClick={handleEnrich}
            disabled={loading}
            className={`flex-1 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'btn-primary shadow-premium hover:shadow-xl hover-glow hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-lg">Enriching...</span>
              </div>
            ) : enrichment ? (
              <span className="flex items-center gap-3 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Enrichment
              </span>
            ) : (
              <span className="flex items-center gap-3 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Enrich Company Data
              </span>
            )}
          </button>
          {onAddToList && (
            <button
              onClick={onAddToList}
              className="btn-secondary px-8 py-4 font-bold shadow-md hover:shadow-lg hover:scale-105"
            >
              <span className="flex items-center gap-3 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save to List
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Error State */}
      {error && (
        <div className="p-8 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 animate-slideUp">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-bold text-red-800">Enrichment Failed</h3>
              <p className="mt-2 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Enrichment Results */}
      {enrichment && isExpanded && (
        <div className="p-10 space-y-10 animate-slideUp">
          {/* Enhanced Summary */}
          <div className="card-premium p-6 hover-glow">
            <h4 className="text-lg font-bold text-gradient mb-4 flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Summary
            </h4>
            <p className="text-gray-700 leading-relaxed text-base">{enrichment.summary}</p>
          </div>

          {/* Enhanced What They Do */}
          <div className="card-premium p-6 hover-glow">
            <h4 className="text-lg font-bold text-gradient-secondary mb-4 flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-7.745M21 13.255V16a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.745M21 13.255a2 2 0 00-2-2h-5a2 2 0 00-2 2v2.745M8 13.255V16a2 2 0 002 2h2a2 2 0 002-2v-2.745" />
                </svg>
              </div>
              What They Do
            </h4>
            <ul className="space-y-2">
              {enrichment.whatTheyDo.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700 leading-relaxed text-sm animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mt-1 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Keywords */}
          {enrichment.keywords.length > 0 && (
            <div className="card-premium p-6 hover-glow">
              <h4 className="text-lg font-bold text-gradient-accent mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {enrichment.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="tag tag-primary hover-lift animate-slideUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Signals */}
          {enrichment.signals.length > 0 && (
            <div className="card-premium p-6 hover-glow">
              <h4 className="text-lg font-bold text-gradient mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Signals
              </h4>
              <div className="space-y-2">
                {enrichment.signals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-3 animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mt-1 flex-shrink-0 animate-pulse" />
                    <span className="text-gray-700 leading-relaxed text-sm">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Sources */}
          {enrichment.sources.length > 0 && (
            <div className="card-premium p-6 hover-glow">
              <h4 className="text-lg font-bold text-gradient-secondary mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                Sources
              </h4>
              <div className="space-y-2">
                {enrichment.sources.map((source, index) => (
                  <div key={index} className="animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 hover:scale-105 transition-all duration-200 text-sm underline decoration-2 underline-offset-2 font-medium"
                    >
                      {source.url.replace('https://', '').replace('http://', '')}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Scraped on {formatDate(source.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Timestamp */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 font-medium text-sm">
                Enriched on {formatDate(enrichment.enrichedAt)}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-500 font-medium text-sm">Data verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

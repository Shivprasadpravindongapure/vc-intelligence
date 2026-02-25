'use client';

import { useState } from 'react';

interface EnrichmentData {
  summary: string;
  whatTheyDo: string;
  keywords: string[];
  signals: string[];
  sources: string[];
  timestamp: string;
  error?: string;
}

interface EnrichmentPanelProps {
  companyUrl: string;
  companyName: string;
  onAddToList?: () => void;
}

export default function EnrichmentPanel({ companyUrl, companyName, onAddToList }: EnrichmentPanelProps) {
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
        const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Enrichment</h3>
            <p className="text-sm text-gray-500">
              {enrichment ? `Last updated: ${formatDate(enrichment.timestamp)}` : 'Get AI-powered insights about this company'}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
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

      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={handleEnrich}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enriching...</span>
              </div>
            ) : enrichment ? (
              'Refresh Enrichment'
            ) : (
              'Enrich Company Data'
            )}
          </button>
          {onAddToList && (
            <button
              onClick={onAddToList}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Save to List
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Enrichment Failed</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrichment Results */}
      {enrichment && isExpanded && (
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700 leading-relaxed">{enrichment.summary}</p>
          </div>

          {/* What They Do */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">What They Do</h4>
            <p className="text-gray-700 leading-relaxed">{enrichment.whatTheyDo}</p>
          </div>

          {/* Keywords */}
          {enrichment.keywords.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {enrichment.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
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
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Signals</h4>
              <div className="space-y-2">
                {enrichment.signals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {enrichment.sources.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sources</h4>
              <div className="space-y-1">
                {enrichment.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    {source.replace('https://', '').replace('http://', '')}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Enriched on {formatDate(enrichment.timestamp)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

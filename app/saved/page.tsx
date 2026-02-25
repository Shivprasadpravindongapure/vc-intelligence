'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  SavedSearch, 
  getSavedSearches, 
  deleteSavedSearch, 
  applySavedSearch 
} from '@/lib/searchManager';

export default function SavedPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load saved searches from localStorage on mount
  useEffect(() => {
    setTimeout(() => {
      setSavedSearches(getSavedSearches());
    }, 0);
  }, []);

  // Handle deleting a saved search
  const handleDeleteSearch = (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    
    try {
      deleteSavedSearch(searchId);
      setSavedSearches(getSavedSearches());
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  // Handle applying a saved search
  const handleApplySearch = (search: SavedSearch) => {
    try {
      applySavedSearch(search);
    } catch (error) {
      console.error('Error applying search:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSearchDescription = (search: SavedSearch) => {
    const parts = [];
    if (search.searchQuery) parts.push(`Search: "${search.searchQuery}"`);
    if (search.selectedIndustry) parts.push(`Industry: ${search.selectedIndustry}`);
    if (search.selectedStage) parts.push(`Stage: ${search.selectedStage}`);
    return parts.length > 0 ? parts.join(' • ') : 'All companies';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Premium Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Saved Searches</h1>
          <p className="text-base text-slate-300">Manage and apply your saved company searches with intelligent filters</p>
        </div>

        {savedSearches.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-20 text-center">
            <div className="text-slate-400 mb-8">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No saved searches yet</h3>
            <p className="text-slate-400 mb-10 max-w-md mx-auto">
              Save your frequently used searches to quickly access them later and streamline your workflow
            </p>
            <button
              onClick={() => window.location.href = '/companies'}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Companies
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {savedSearches.map((search, index) => (
              <div
                key={search.id}
                className="p-10 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/70 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{search.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-400 font-medium">Active</span>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-8 leading-relaxed text-lg">{getSearchDescription(search)}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-3 text-slate-400 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Created {formatDate(search.createdAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {search.searchQuery && (
                          <span className="inline-flex items-center px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {search.searchQuery}
                          </span>
                        )}
                        {search.selectedIndustry && (
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-xs border border-emerald-500/30">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {search.selectedIndustry}
                          </span>
                        )}
                        {search.selectedStage && (
                          <span className="inline-flex items-center px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs border border-orange-500/30">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {search.selectedStage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 ml-8">
                    <button
                      onClick={() => handleApplySearch(search)}
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Apply Search
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="p-4 text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

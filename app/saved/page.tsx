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
    setSavedSearches(getSavedSearches());
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600">Manage and apply your saved company searches</p>
        </div>

        {savedSearches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches yet</h3>
            <p className="text-gray-500 mb-6">
              Save your frequently used searches to quickly access them later
            </p>
            <button
              onClick={() => window.location.href = '/companies'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search Companies
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{search.name}</h3>
                    <p className="text-gray-600 mb-3">{getSearchDescription(search)}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created {formatDate(search.createdAt)}</span>
                      {search.searchQuery && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Search: {search.searchQuery}
                        </span>
                      )}
                      {search.selectedIndustry && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {search.selectedIndustry}
                        </span>
                      )}
                      {search.selectedStage && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                          {search.selectedStage}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApplySearch(search)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Apply
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete search"
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

'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { companies, industries, stages, Company } from '@/lib/mockData';
import Link from 'next/link';
import { createSavedSearch } from '@/lib/searchManager';
import EnrichmentPanel from '@/components/EnrichmentPanel';
import { 
  CompanyList, 
  getLists, 
  addCompanyToList, 
  createList 
} from '@/lib/listManager';

type SortField = 'name' | 'industry' | 'stage';
type SortDirection = 'asc' | 'desc';

function CompaniesPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Load URL parameters on mount
  useEffect(() => {
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const stage = searchParams.get('stage');
    
    setTimeout(() => {
      if (search) setSearchQuery(search);
      if (industry) setSelectedIndustry(industry);
      if (stage) setSelectedStage(stage);
      // Load lists
      setLists(getLists());
    }, 0);
  }, [searchParams]);

  
  const itemsPerPage = 5;

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    const filtered = companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
      const matchesStage = !selectedStage || company.stage === selectedStage;
      return matchesSearch && matchesIndustry && matchesStage;
    });

    
    // Sort companies
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedIndustry, selectedStage, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredAndSortedCompanies.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedStage('');
    setCurrentPage(1);
  };

  // Handle save search
  const handleSaveSearch = () => {
    if (!searchQuery && !selectedIndustry && !selectedStage) {
      alert('Please apply some filters before saving a search.');
      return;
    }
    setShowSaveSearchModal(true);
  };

  // Handle create saved search
  const handleCreateSavedSearch = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for your saved search.');
      return;
    }
    
    try {
      createSavedSearch(
        searchName.trim(),
        searchQuery,
        selectedIndustry,
        selectedStage
      );
      
      setSearchName('');
      setShowSaveSearchModal(false);
      alert('Search saved successfully!');
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search.');
    }
  };

  // Handle company click for enrichment
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setShowEnrichmentModal(true);
  };

  // Handle close enrichment modal
  const handleCloseEnrichmentModal = () => {
    setSelectedCompany(null);
    setShowEnrichmentModal(false);
  };

  // Handle add to list
  const handleAddToList = () => {
    if (!selectedCompany) return;
    setShowListModal(true);
  };

  // Handle create new list
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    
    try {
      const newList = createList(newListName.trim());
      setLists(getLists());
      setNewListName('');
      
      // Add company to the new list
      if (selectedCompany) {
        addCompanyToList(newList.id, selectedCompany.id);
        setLists(getLists());
      }
      
      setShowListModal(false);
      alert(`List "${newListName}" created and company added successfully!`);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list.');
    }
  };

  // Handle add company to existing list
  const handleAddToExistingList = (listId: string) => {
    if (!selectedCompany) return;
    
    try {
      addCompanyToList(listId, selectedCompany.id);
      setLists(getLists());
      setShowListModal(false);
      alert(`Added ${selectedCompany.name} to list successfully!`);
    } catch (error) {
      console.error('Error adding to list:', error);
      alert('Failed to add company to list.');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">VC Intelligence Platform</h1>
          <p className="text-lg text-gray-600">Discover and analyze innovative companies with AI-powered insights</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Companies
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                id="industry"
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                id="stage"
                value={selectedStage}
                onChange={(e) => {
                  setSelectedStage(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedIndustry || selectedStage) && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset Filters
              </button>
              <button
                onClick={handleSaveSearch}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Save Search
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {paginatedCompanies.length} of {filteredAndSortedCompanies.length} companies
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Company
                      {sortField === 'name' && (
                        <span className="ml-2 text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('industry')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Industry
                      {sortField === 'industry' && (
                        <span className="ml-2 text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('stage')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Stage
                      {sortField === 'stage' && (
                        <span className="ml-2 text-blue-600">
                          {sortDirection === 'asc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedCompanies.length > 0 ? (
                  paginatedCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <button
                            onClick={() => handleCompanyClick(company)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer text-left transition-colors"
                          >
                            {company.name}
                          </button>
                          <div className="text-sm text-gray-500 mt-1">
                            {company.description.substring(0, 80)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                          {company.industry}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          company.stage === 'Series C' || company.stage === 'Series B' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' :
                          company.stage === 'Series A' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300' :
                          company.stage === 'Seed' ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300' :
                          company.stage === 'Public' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
                        }`}>
                          {company.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCompanyClick(company)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Analyze
                          </button>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Save Search Modal */}
        {showSaveSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Search</h3>
              <div className="mb-4">
                <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name
                </label>
                <input
                  id="searchName"
                  type="text"
                  placeholder="Enter a name for this search..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateSavedSearch()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Criteria:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {searchQuery && <div>• Search: &quot;{searchQuery}&quot;</div>}
                  {selectedIndustry && <div>• Industry: {selectedIndustry}</div>}
                  {selectedStage && <div>• Stage: {selectedStage}</div>}
                  {!searchQuery && !selectedIndustry && !selectedStage && <div>• No filters applied</div>}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSavedSearch}
                  disabled={!searchName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Search
                </button>
                <button
                  onClick={() => {
                    setShowSaveSearchModal(false);
                    setSearchName('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enrichment Modal */}
        {showEnrichmentModal && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedCompany.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {selectedCompany.industry}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCompany.stage === 'Series C' ? 'bg-green-100 text-green-800' :
                        selectedCompany.stage === 'Series B' ? 'bg-green-100 text-green-800' :
                        selectedCompany.stage === 'Series A' ? 'bg-yellow-100 text-yellow-800' :
                        selectedCompany.stage === 'Seed' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCompany.stage}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseEnrichmentModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enrichment Content */}
              <div className="p-6">
                <EnrichmentPanel 
                  companyUrl={selectedCompany.website} 
                  companyName={selectedCompany.name} 
                  onAddToList={handleAddToList}
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                  <button
                    onClick={handleCloseEnrichmentModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List Selection Modal */}
        {showListModal && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add {selectedCompany.name} to List
              </h3>
              
              {/* Create New List */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create New List
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New list name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCreateList}
                    disabled={!newListName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Or Add to Existing List */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Add to Existing List
                </label>
                {lists.length === 0 ? (
                  <p className="text-gray-500 text-sm">No lists created yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToExistingList(list.id)}
                        className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{list.name}</div>
                        <div className="text-sm text-gray-500">{list.companies.length} companies</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowListModal(false);
                    setNewListName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompaniesPageContent />
    </Suspense>
  );
}

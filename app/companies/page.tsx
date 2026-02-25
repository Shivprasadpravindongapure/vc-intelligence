'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { companies, industries, stages, Company } from '@/lib/mockData';
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
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('main-search')?.focus();
      }
      
      // Ctrl/Cmd + E: Export data
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportData();
      }
      
      // Ctrl/Cmd + A: Select all visible companies
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const visibleIds = new Set(paginatedCompanies.map(c => c.id));
        setSelectedCompanies(visibleIds);
      }
      
      // Escape: Clear selections and close modals
      if (e.key === 'Escape') {
        setSelectedCompanies(new Set());
        setShowEnrichmentModal(false);
        setShowSaveSearchModal(false);
        setShowListModal(false);
      }
      
      // ?: Show keyboard shortcuts
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      
      // Arrow keys for pagination
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, paginatedCompanies, showKeyboardShortcuts]);

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

  // Handle export data
  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      filters: {
        searchQuery,
        selectedIndustry,
        selectedStage
      },
      totalCompanies: filteredAndSortedCompanies.length,
      companies: filteredAndSortedCompanies.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        stage: company.stage,
        website: company.website
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const fileName = searchQuery || 'all-companies';
    link.download = `${fileName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle bulk export
  const handleBulkExport = () => {
    const selectedCompaniesData = filteredAndSortedCompanies.filter(company => 
      selectedCompanies.has(company.id)
    );
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      type: 'bulk_export',
      filters: {
        searchQuery,
        selectedIndustry,
        selectedStage
      },
      totalCompanies: selectedCompaniesData.length,
      companies: selectedCompaniesData.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        stage: company.stage,
        website: company.website
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk-export-${selectedCompanies.size}-companies-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Company Directory</h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">Discover and analyze innovative companies with AI-powered insights and advanced filtering</p>
              <div className="hidden lg:flex items-center gap-3 mt-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-400 font-medium">Live Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Search and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          {/* Full-width Search Bar */}
          <div className="mb-6">
            <div className="relative group">
              <input
                id="main-search"
                type="text"
                placeholder="Search companies, sectors, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-12 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enhanced Industry Filter */}
            <div>
              <label htmlFor="industry" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Industry
              </label>
              <div className="relative">
                <select
                  id="industry"
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-white transition-all duration-200"
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Stage Filter */}
            <div>
              <label htmlFor="stage" className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Stage
              </label>
              <div className="relative">
                <select
                  id="stage"
                  value={selectedStage}
                  onChange={(e) => {
                    setSelectedStage(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-white transition-all duration-200"
                >
                  <option value="">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Actions */}
          {(searchQuery || selectedIndustry || selectedStage) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 font-medium text-sm transition-all duration-200 border border-slate-600/50"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </span>
              </button>
              <button
                onClick={handleSaveSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12m3-3v12m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Save Search
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{paginatedCompanies.length}</span> of <span className="text-white font-bold">{filteredAndSortedCompanies.length}</span> companies
            </div>
            {selectedCompanies.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <span className="text-sm text-blue-300 font-medium">
                  {selectedCompanies.size} selected
                </span>
                <button
                  onClick={handleBulkExport}
                  className="text-blue-400 hover:text-blue-300 transition-colors mr-2"
                  title="Export selected"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedCompanies(new Set())}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {filteredAndSortedCompanies.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-400">Live data</span>
              </div>
            )}
            {filteredAndSortedCompanies.length > 0 && (
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-emerald-600/50 text-emerald-300 rounded-lg font-medium hover:bg-emerald-600/70 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </button>
            )}
            <button
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="px-3 py-2 bg-slate-600/50 text-slate-300 rounded-lg font-medium hover:bg-slate-500/50 transition-all duration-200 text-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Press ?
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced Companies Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="bg-slate-900/50 p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company Directory
            </h3>
            <p className="text-slate-400 text-sm mt-1">Browse and analyze innovative companies</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/30 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.size === paginatedCompanies.length && paginatedCompanies.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const visibleIds = new Set(paginatedCompanies.map(c => c.id));
                          setSelectedCompanies(visibleIds);
                        } else {
                          setSelectedCompanies(new Set());
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    #
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Company
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      {sortField === 'name' && (
                        <span className="text-blue-400 font-bold">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('industry')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Industry
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      {sortField === 'industry' && (
                        <span className="text-blue-400 font-bold">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('stage')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      Stage
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      {sortField === 'stage' && (
                        <span className="text-blue-400 font-bold">
                          {sortDirection === 'asc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                {paginatedCompanies.length > 0 ? (
                  paginatedCompanies.map((company, index) => (
                    <tr key={company.id} className={`hover:bg-slate-700/30 transition-all duration-300 group ${selectedCompanies.has(company.id) ? 'bg-blue-900/10' : ''}`}>
                      <td className="px-6 py-6">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.has(company.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedCompanies);
                            if (e.target.checked) {
                              newSelected.add(company.id);
                            } else {
                              newSelected.delete(company.id);
                            }
                            setSelectedCompanies(newSelected);
                          }}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center">
                          <span className="text-lg font-bold text-slate-400 group-hover:text-white transition-colors">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleCompanyClick(company)}
                              className="text-lg font-bold text-white hover:text-blue-400 cursor-pointer text-left transition-all hover:scale-105 transform block group-hover:text-blue-400"
                            >
                              {company.name}
                            </button>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-2">
                              {company.description.substring(0, 120)}...
                            </p>
                          </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                          {company.industry}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          company.stage === 'Series C' || company.stage === 'Series B' ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50' :
                          company.stage === 'Series A' ? 'bg-blue-900/30 text-blue-300 border-blue-700/50' :
                          company.stage === 'Seed' ? 'bg-orange-900/30 text-orange-300 border-orange-700/50' :
                          company.stage === 'Public' ? 'bg-purple-900/30 text-purple-300 border-purple-700/50' :
                          'bg-slate-700/50 text-slate-300 border-slate-600/50'
                        }`}>
                          {company.stage}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCompanyClick(company)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Enrich
                          </button>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg font-medium hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <td colSpan={6} className="px-12 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-8">
                          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">No companies found</h3>
                        <p className="text-slate-400 mb-8 text-center max-w-md">
                          Try adjusting your search criteria or filters to find the companies you're looking for.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400 font-medium">
              Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </span>
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-6 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedCompany.name}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">{selectedCompany.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-3 py-1 bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded-full text-xs font-medium">
                        {selectedCompany.industry}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        selectedCompany.stage === 'Series C' || selectedCompany.stage === 'Series B' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' :
                        selectedCompany.stage === 'Series A' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                        selectedCompany.stage === 'Seed' ? 'bg-orange-900/40 text-orange-300 border-orange-700/50' :
                        selectedCompany.stage === 'Public' ? 'bg-purple-900/40 text-purple-300 border-purple-700/50' :
                        'bg-slate-700/50 text-slate-300 border-slate-600/50'
                      }`}>
                        {selectedCompany.stage}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseEnrichmentModal}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 ml-4"
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
                  onAddToList={handleAddToList}
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-700/50 p-6 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:scale-105 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                  <button
                    onClick={handleCloseEnrichmentModal}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium"
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">
                Add {selectedCompany.name} to List
              </h3>
              
              {/* Create New List */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                  Create New List
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New list name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                    className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
                  />
                  <button
                    onClick={handleCreateList}
                    disabled={!newListName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-all duration-200"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Or Add to Existing List */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                  Or Add to Existing List
                </label>
                {lists.length === 0 ? (
                  <p className="text-slate-500 text-sm">No lists created yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToExistingList(list.id)}
                        className="w-full text-left p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200"
                      >
                        <div className="font-medium text-white">{list.name}</div>
                        <div className="text-sm text-slate-400">{list.companies.length} companies</div>
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
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Focus search</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">Ctrl/Cmd + K</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Export data</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">Ctrl/Cmd + E</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Select all visible</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">Ctrl/Cmd + A</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Previous page</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">←</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Next page</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">→</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Clear selections & close modals</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">Esc</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">?</kbd>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Pro tip:</strong> These shortcuts work anywhere on the page except when typing in input fields.
                </p>
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

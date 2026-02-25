'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { companies, Company } from '@/lib/mockData';
import { 
  CompanyList, 
  getLists, 
  createList, 
  removeCompanyFromList, 
  deleteList, 
  exportListToJSON 
} from '@/lib/listManager';

export default function ListsPage() {
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load lists from localStorage on mount
  useEffect(() => {
    const loadedLists = getLists();
    setLists(loadedLists);
  }, []);

  // Handle creating a new list
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    
    setLoading(true);
    try {
      const newList = createList(newListName.trim());
      const updatedLists = getLists();
      setLists(updatedLists);
      setNewListName('');
      setShowCreateForm(false);
      setSelectedListId(newList.id);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a list
  const handleDeleteList = (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    
    try {
      deleteList(listId);
      setLists(getLists());
      if (selectedListId === listId) {
        setSelectedListId('');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  // Handle exporting a list
  const handleExportList = (list: CompanyList) => {
    try {
      exportListToJSON(list);
    } catch (error) {
      console.error('Error exporting list:', error);
    }
  };

  // Get selected list details
  const selectedList = lists.find(list => list.id === selectedListId);
  
  // Get companies in selected list
  const selectedListCompanies = selectedList 
    ? selectedList.companies.map(id => companies.find(c => c.id === id)).filter(Boolean) as Company[]
    : [];

  return (
    <Layout>
      {/* Premium Header */}
      <div className="mb-6 px-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Company Lists</h1>
        <p className="text-base text-slate-300">Create and manage your company lists with advanced features</p>
      </div>

      <div className="flex h-[calc(100vh-12rem)] gap-6">
        {/* Premium Lists Sidebar - Full Height Like Navbar */}
        <div className="w-80 flex-shrink-0 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-700/50 bg-slate-900/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">My Lists</h2>
                <p className="text-xs text-slate-400">{lists.length} list{lists.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                title="New List"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Create List Form */}
          {showCreateForm && (
            <div className="p-4 border-b border-slate-700/50 bg-slate-700/30">
              <input
                type="text"
                placeholder="Enter list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                className="w-full px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 text-white placeholder-slate-400 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateList}
                  disabled={loading || !newListName.trim()}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </span>
                  ) : (
                    'Create'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewListName('');
                  }}
                  className="px-3 py-1.5 bg-slate-600/50 text-slate-300 rounded-lg font-medium hover:bg-slate-500/50 transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Lists Container - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {lists.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-6">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No lists yet</h3>
                <p className="text-slate-400 text-sm mb-4">Create your first list</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-4 cursor-pointer transition-all duration-200 rounded-lg border ${
                      selectedListId === list.id
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50'
                    }`}
                    onClick={() => setSelectedListId(list.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        {list.name}
                        {selectedListId === list.id && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        )}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportList(list);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                          title="Export"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-600/50 rounded text-slate-300">
                        {list.companies.length} companies
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          {selectedList ? (
            <>
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedList.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30">
                      {selectedListCompanies.length} companies
                    </span>
                    <span>Created {new Date(selectedList.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleExportList(selectedList)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export JSON
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">

                {selectedListCompanies.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-slate-400 mb-8">
                      <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">No companies yet</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Add companies to this list from their profile pages to start building your investment pipeline
                    </p>
                    <button
                      onClick={() => window.location.href = '/companies'}
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse Companies
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedListCompanies.map((company, index) => (
                      <div
                        key={company.id}
                        className="p-8 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{company.name}</h4>
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1 bg-slate-600/50 text-slate-300 rounded-full text-xs border border-slate-500/50">
                                  {company.industry}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                  company.stage === 'Series C' || company.stage === 'Series B' ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50' :
                                  company.stage === 'Series A' ? 'bg-blue-900/30 text-blue-300 border-blue-700/50' :
                                  company.stage === 'Seed' ? 'bg-orange-900/30 text-orange-300 border-orange-700/50' :
                                  company.stage === 'Public' ? 'bg-purple-900/30 text-purple-300 border-purple-700/50' :
                                  'bg-slate-600/50 text-slate-300 border-slate-500/50'
                                }`}>
                                  {company.stage}
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-400 mb-4 leading-relaxed">{company.description}</p>
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-2 hover:scale-105 transition-transform font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {company.website.replace('https://', '').replace('http://', '')}
                              </a>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              removeCompanyFromList(selectedList.id, company.id);
                              setLists(getLists()); // Refresh lists
                            }}
                            className="p-4 text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-16">
              <div className="text-center">
                <div className="text-slate-400 mb-6">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Select a list to view</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Create a new list or select an existing one to start managing your company portfolio
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

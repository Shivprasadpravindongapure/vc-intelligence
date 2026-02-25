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
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-2">Lists</h1>
          <p className="text-lg text-gray-600">Create and manage your company lists with advanced features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Premium Lists Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 border border-white/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Lists</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-primary px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New List
                  </span>
                </button>
              </div>

              {/* Enhanced Create List Form */}
              {showCreateForm && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Enter list name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 shadow-sm"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateList}
                      disabled={loading || !newListName.trim()}
                      className="flex-1 btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        'Create List'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewListName('');
                      }}
                      className="btn-secondary px-4 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced Lists List */}
              <div className="space-y-4">
                {lists.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-6">
                      <svg className="w-16 h-16 mx-auto animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No lists yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Create your first list to get started</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn-primary px-6 py-3 text-sm font-bold shadow-premium hover:shadow-xl hover-glow"
                    >
                      Create First List
                    </button>
                  </div>
                ) : (
                  lists.map((list, index) => (
                    <div
                      key={list.id}
                      className={`card-premium p-6 cursor-pointer transition-all duration-300 animate-slideUp hover-glow ${
                        selectedListId === list.id
                          ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-105'
                          : 'hover:shadow-xl hover:scale-102'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedListId(list.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                            {list.name}
                            {selectedListId === list.id && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="tag tag-primary hover-lift">
                              {list.companies.length} companies
                            </span>
                            <span className="text-xs flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(list.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportList(list);
                            }}
                            className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-110 tooltip"
                            data-tooltip="Export list"
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
                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 tooltip"
                            data-tooltip="Delete list"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Selected List Content */}
          <div className="lg:col-span-2">
            {selectedList ? (
              <div className="glass rounded-2xl p-8 border border-white/20 shadow-premium">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gradient mb-2">{selectedList.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="badge badge-primary">
                        {selectedListCompanies.length} companies
                      </span>
                      <span>Created {new Date(selectedList.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExportList(selectedList)}
                    className="btn-primary px-6 py-3 font-semibold shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export JSON
                    </span>
                  </button>
                </div>

                {selectedListCompanies.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-gray-400 mb-8">
                      <svg className="w-24 h-24 mx-auto animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No companies yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                      Add companies to this list from their profile pages to start building your investment pipeline
                    </p>
                    <button
                      onClick={() => window.location.href = '/companies'}
                      className="btn-primary px-8 py-4 font-bold shadow-premium hover:shadow-xl hover-glow text-lg"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="card-premium p-8 hover:shadow-xl transition-all duration-300 animate-slideUp hover-glow group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{company.name}</h4>
                              <div className="flex items-center gap-3">
                                <span className="tag tag-primary hover-lift">
                                  {company.industry}
                                </span>
                                <span className={`tag hover-lift ${
                                  company.stage === 'Series C' || company.stage === 'Series B' ? 'tag-success' :
                                  company.stage === 'Series A' ? 'tag-warning' :
                                  company.stage === 'Seed' ? 'tag-error' :
                                  company.stage === 'Public' ? 'tag-primary' :
                                  'tag-primary'
                                }`}>
                                  {company.stage}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{company.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 hover:scale-105 transition-transform font-medium"
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
                            className="p-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 tooltip"
                            data-tooltip="Remove from list"
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
            ) : (
              <div className="glass rounded-2xl p-16 text-center border border-white/20">
                <div className="text-gray-400 mb-6">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Select a list to view</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Create a new list or select an existing one to start managing your company portfolio
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { companies, Company } from '@/lib/mockData';
import { 
  CompanyList, 
  getLists, 
  createList, 
  addCompanyToList, 
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
    console.log('Loaded lists from localStorage:', loadedLists);
    setLists(loadedLists);
  }, []);

  // Handle creating a new list
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    
    setLoading(true);
    try {
      console.log('Creating list:', newListName.trim());
      const newList = createList(newListName.trim());
      const updatedLists = getLists();
      console.log('Updated lists after creation:', updatedLists);
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lists</h1>
          <p className="text-gray-600">Create and manage your company lists</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Lists</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  + New List
                </button>
              </div>

              {/* Create List Form */}
              {showCreateForm && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    placeholder="List name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateList}
                      disabled={loading || !newListName.trim()}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewListName('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Lists List */}
              <div className="space-y-2">
                {lists.length === 0 ? (
                  <p className="text-gray-500 text-sm">No lists created yet</p>
                ) : (
                  lists.map((list) => (
                    <div
                      key={list.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedListId === list.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedListId(list.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{list.name}</h3>
                          <p className="text-sm text-gray-500">{list.companies.length} companies</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportList(list);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
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
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
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

          {/* Selected List Content */}
          <div className="lg:col-span-2">
            {selectedList ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedList.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedListCompanies.length} companies • 
                      Created {new Date(selectedList.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportList(selectedList)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export JSON
                  </button>
                </div>

                {selectedListCompanies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                    <p className="text-gray-500 mb-4">
                      Add companies to this list from their profile pages
                    </p>
                    <button
                      onClick={() => window.location.href = '/companies'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Browse Companies
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedListCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{company.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {company.industry}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {company.stage}
                            </span>
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {company.website.replace('https://', '').replace('http://', '')}
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            removeCompanyFromList(selectedList.id, company.id);
                            setLists(getLists()); // Refresh lists
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Remove from list"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a list to view</h3>
                <p className="text-gray-500">
                  Create a new list or select an existing one to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

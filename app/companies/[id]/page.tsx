'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { companies, Company } from '@/lib/mockData';
import { 
  CompanyList, 
  getLists, 
  addCompanyToList 
} from '@/lib/listManager';

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<CompanyList[]>([]);

  // Fetch company data
  useEffect(() => {
    const foundCompany = companies.find(c => c.id === companyId);
    if (foundCompany) {
      setCompany(foundCompany);
      // Load notes from localStorage
      const savedNotes = localStorage.getItem(`company-notes-${companyId}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
      // Load lists
      setLists(getLists());
    } else {
      // Company not found, redirect to companies page
      router.push('/companies');
    }
    setLoading(false);
  }, [companyId, router]);

  // Save notes to localStorage
  const saveNotes = () => {
    setSaveStatus('saving');
    localStorage.setItem(`company-notes-${companyId}`, notes);
    
    // Show saved status briefly
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 1500);
    }, 500);
  };

  // Handle save to list
  const handleSaveToList = () => {
    if (lists.length === 0) {
      alert('No lists found. Please create a list first.');
      return;
    }
    setShowListModal(true);
  };

  // Handle adding company to list
  const handleAddToList = (listId: string) => {
    const success = addCompanyToList(listId, companyId);
    if (success) {
      setShowListModal(false);
      setLists(getLists()); // Refresh lists
      alert('Company added to list successfully!');
    } else {
      alert('Company is already in this list.');
    }
  };

  // Handle enrich (placeholder for now)
  const handleEnrich = () => {
    // Placeholder functionality - will implement backend later
    alert('Enrich functionality coming soon! This will fetch additional company data.');
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-6">The company you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/companies')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Companies
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/companies')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Companies
        </button>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {company.industry}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  company.stage === 'Series C' ? 'bg-green-100 text-green-800' :
                  company.stage === 'Series B' ? 'bg-green-100 text-green-800' :
                  company.stage === 'Series A' ? 'bg-yellow-100 text-yellow-800' :
                  company.stage === 'Seed' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {company.stage}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveToList}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                Save to List
              </button>
              <button
                onClick={handleEnrich}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Enrich Data
              </button>
            </div>
          </div>

          {/* Website */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {company.website}
            </a>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{company.description}</p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
            <button
              onClick={saveNotes}
              disabled={saveStatus === 'saving'}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                saveStatus === 'saving' 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : saveStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'saved' ? 'Saved!' : 
               'Save Notes'}
            </button>
          </div>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes about this company here..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="mt-2 text-sm text-gray-500">
            Notes are automatically saved locally in your browser.
          </div>
        </div>

        {/* List Selection Modal */}
        {showListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save to List</h3>
              <p className="text-gray-600 mb-4">Choose a list to add "{company?.name}" to:</p>
              
              {lists.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No lists found. Create a list first.</p>
                  <button
                    onClick={() => {
                      setShowListModal(false);
                      router.push('/lists');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create List
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                      className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{list.name}</div>
                      <div className="text-sm text-gray-500">{list.companies.length} companies</div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowListModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

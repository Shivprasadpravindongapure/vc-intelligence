'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { companies, Company } from '@/lib/mockData';
import { 
  CompanyList, 
  getLists, 
  addCompanyToList,
  createList 
} from '@/lib/listManager';
import EnrichmentPanel from '@/components/EnrichmentPanel';

// Extended company interface with additional metadata
interface ExtendedCompany extends Company {
  founded?: number;
  employees?: string;
  lastFunding?: string;
  lastFundingAmount?: string;
  location?: string;
  tags?: string[];
}

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<ExtendedCompany | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [showEnrichment, setShowEnrichment] = useState(false);

  // Enhanced company data with metadata for each company
  const enhancedCompanies: ExtendedCompany[] = [
    {
      ...companies[0], // OpenAI
      founded: 2015,
      employees: '1000-5000',
      lastFunding: 'Series C',
      lastFundingAmount: '$10B',
      location: 'San Francisco, CA',
      tags: ['ai', 'research', 'machine learning']
    },
    {
      ...companies[1], // Stripe
      founded: 2010,
      employees: '5000+',
      lastFunding: 'Series I',
      lastFundingAmount: '$6.5B',
      location: 'San Francisco, CA',
      tags: ['fintech', 'payments', 'api']
    },
    {
      ...companies[2], // Airbnb
      founded: 2008,
      employees: '5000+',
      lastFunding: 'Public',
      lastFundingAmount: '$86B',
      location: 'San Francisco, CA',
      tags: ['travel', 'marketplace', 'hospitality']
    },
    {
      ...companies[3], // SpaceX
      founded: 2002,
      employees: '5000+',
      lastFunding: 'Series F',
      lastFundingAmount: '$100B',
      location: 'Hawthorne, CA',
      tags: ['aerospace', 'space', 'transportation']
    },
    {
      ...companies[4], // Discord
      founded: 2015,
      employees: '1000-5000',
      lastFunding: 'Series H',
      lastFundingAmount: '$15B',
      location: 'San Francisco, CA',
      tags: ['social', 'gaming', 'communication']
    },
    {
      ...companies[5], // Notion
      founded: 2016,
      employees: '1000-5000',
      lastFunding: 'Series D',
      lastFundingAmount: '$10B',
      location: 'San Francisco, CA',
      tags: ['productivity', 'collaboration', 'tools']
    },
    {
      ...companies[6], // Figma
      founded: 2012,
      employees: '1000-5000',
      lastFunding: 'Series E',
      lastFundingAmount: '$10B',
      location: 'San Francisco, CA',
      tags: ['design', 'collaboration', 'tools']
    },
    {
      ...companies[7], // Rivian
      founded: 2009,
      employees: '5000+',
      lastFunding: 'Public',
      lastFundingAmount: '$85B',
      location: 'Irvine, CA',
      tags: ['automotive', 'electric', 'ev']
    },
    {
      ...companies[8], // Instacart
      founded: 2012,
      employees: '5000+',
      lastFunding: 'Public',
      lastFundingAmount: '$39B',
      location: 'San Francisco, CA',
      tags: ['grocery', 'delivery', 'logistics']
    },
    {
      ...companies[9], // Databricks
      founded: 2013,
      employees: '5000+',
      lastFunding: 'Series I',
      lastFundingAmount: '$38B',
      location: 'San Francisco, CA',
      tags: ['data', 'analytics', 'machine learning']
    },
    {
      ...companies[10], // Anthropic
      founded: 2021,
      employees: '1000-5000',
      lastFunding: 'Series D',
      lastFundingAmount: '$4B',
      location: 'San Francisco, CA',
      tags: ['ai', 'research', 'safety']
    },
    {
      ...companies[11], // Plaid
      founded: 2013,
      employees: '1000-5000',
      lastFunding: 'Series L',
      lastFundingAmount: '$2.5B',
      location: 'San Francisco, CA',
      tags: ['fintech', 'api', 'banking']
    },
    {
      ...companies[12], // Robinhood
      founded: 2013,
      employees: '1000-5000',
      lastFunding: 'Public',
      lastFundingAmount: '$20B',
      location: 'Menlo Park, CA',
      tags: ['fintech', 'trading', 'investing']
    },
    {
      ...companies[13], // Zoom
      founded: 2011,
      employees: '5000+',
      lastFunding: 'Public',
      lastFundingAmount: '$18B',
      location: 'San Jose, CA',
      tags: ['communication', 'video', 'remote']
    },
    {
      ...companies[14], // Shopify
      founded: 2006,
      employees: '5000+',
      lastFunding: 'Public',
      lastFundingAmount: '$130B',
      location: 'Ottawa, Canada',
      tags: ['ecommerce', 'platform', 'retail']
    }
  ];

  // Fetch company data
  useEffect(() => {
    const foundCompany = enhancedCompanies.find(c => c.id === companyId);
    if (foundCompany) {
      setTimeout(() => {
        setCompany(foundCompany);
        // Load notes from localStorage
        const savedNotes = localStorage.getItem(`company-notes-${companyId}`);
        if (savedNotes) {
          setNotes(savedNotes);
        }
        // Load lists
        setLists(getLists());
        setLoading(false);
      }, 0);
    } else {
      // Company not found, redirect to companies page
      router.push('/companies');
    }
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
    if (!company) return;
    
    try {
      addCompanyToList(listId, company.id);
      setLists(getLists());
      setShowListModal(false);
      alert(`Added ${company.name} to list successfully!`);
    } catch (error) {
      console.error('Error adding to list:', error);
      alert('Company is already in this list.');
    }
  };

  // Handle create new list
  const handleCreateList = () => {
    if (!newListName.trim() || !company) return;
    
    try {
      const newList = createList(newListName.trim());
      addCompanyToList(newList.id, company.id);
      setLists(getLists());
      setNewListName('');
      setShowListModal(false);
      alert(`List "${newListName}" created and company added successfully!`);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list.');
    }
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
          <p className="text-gray-600 mb-6">The company you&apos;re looking for doesn&apos;t exist.</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/companies')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Companies
        </button>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {company.website.replace('https://', '').replace('http://', '')}
                </a>
                <span>•</span>
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {company.industry}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                  {company.location}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  company.stage === 'Series C' || company.stage === 'Series B' ? 'bg-green-100 text-green-800' :
                  company.stage === 'Series A' ? 'bg-yellow-100 text-yellow-800' :
                  company.stage === 'Seed' ? 'bg-orange-100 text-orange-800' :
                  company.stage === 'Public' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {company.stage}
                </span>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveToList}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                Save to List
              </button>
              <button
                onClick={() => setShowEnrichment(!showEnrichment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                {showEnrichment ? 'Hide AI' : 'Enrich with AI'}
              </button>
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Founded</h4>
              <p className="text-gray-900">{company.founded}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Employees</h4>
              <p className="text-gray-900">{company.employees}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Last Funding</h4>
              <p className="text-gray-900">{company.lastFundingAmount} {company.lastFunding}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Stage</h4>
              <p className="text-gray-900">{company.stage}</p>
            </div>
          </div>

          {/* Tags */}
          {company.tags && company.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">{company.description}</p>
          </div>
        </div>

        {/* AI Enrichment Section */}
        {showEnrichment && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <EnrichmentPanel 
              companyUrl={company.website} 
              companyName={company.name} 
            />
          </div>
        )}

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
            placeholder="Add a note..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="mt-2 text-sm text-gray-500">
            {notes.trim() ? 'Notes are automatically saved locally in your browser.' : 'No notes yet. Add one above.'}
          </div>
        </div>

        {/* List Selection Modal */}
        {showListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save to List</h3>
              <p className="text-gray-600 mb-4">Choose a list to add &quot;{company?.name}&quot; to:</p>
              
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

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { companies, Company } from '@/lib/mockData';
import { 
  CompanyList, 
  getLists, 
  addCompanyToList,
  createList 
} from '@/lib/listManager';

type ReEnrichmentData = {
  employees?: number;
  founded?: string;
  headquarters?: string;
  valuation?: string;
  funding?: string;
  businessModel?: string;
  targetMarket?: string;
  technologies?: string[];
  competitors?: string[];
  market?: string;
  financials?: Company['financials'];
};

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState('');
  const [isReEnriching, setIsReEnriching] = useState(false);
  const notesStorageKey = `vc-notes-${companyId}`;

  useEffect(() => {
    const foundCompany = companies.find(c => c.id === companyId);
    setCompany(foundCompany || null);
    setLists(getLists());
    if (typeof window !== 'undefined') {
      setNotes(localStorage.getItem(notesStorageKey) || '');
      setNoteStatus('');
    }
    setLoading(false);
  }, [companyId, notesStorageKey]);

  const handleSaveNotes = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(notesStorageKey, notes);
    setNoteStatus('Notes saved');
  };

  // Handle re-enrichment with real-time data
  const handleReEnrich = async () => {
    if (!company) return;
    
    setIsReEnriching(true);
    try {
      // Simulate real-time data fetching
      const enrichedData = await fetchRealTimeEnrichment();
      
      // Update company with new data
      setCompany({
        ...company,
        employees: enrichedData.employees || company.employees,
        founded: enrichedData.founded || company.founded,
        headquarters: enrichedData.headquarters || company.headquarters,
        valuation: enrichedData.valuation || company.valuation,
        funding: enrichedData.funding || company.funding,
        businessModel: enrichedData.businessModel || company.businessModel,
        targetMarket: enrichedData.targetMarket || company.targetMarket,
        technologies: enrichedData.technologies || company.technologies,
        competitors: enrichedData.competitors || company.competitors,
        market: enrichedData.market || company.market,
        financials: enrichedData.financials || company.financials
      });
    } catch (error) {
      console.error('Re-enrichment failed:', error);
    } finally {
      setIsReEnriching(false);
    }
  };

  // Fetch real-time enrichment data
  const fetchRealTimeEnrichment = async (): Promise<ReEnrichmentData> => {
    // Simulate API call with real-time data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          employees: Math.floor(Math.random() * 10000) + 100,
          founded: (2010 + Math.floor(Math.random() * 14)).toString(),
          headquarters: ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Singapore'][Math.floor(Math.random() * 6)],
          valuation: '$' + (Math.floor(Math.random() * 10) + 1) + 'B',
          funding: '$' + (Math.floor(Math.random() * 500) + 50) + 'M',
          businessModel: ['SaaS', 'Marketplace', 'Platform', 'Direct-to-Consumer', 'B2B'][Math.floor(Math.random() * 5)],
          targetMarket: ['Enterprise', 'SMB', 'Consumer', 'Developer', 'Healthcare'][Math.floor(Math.random() * 5)],
          technologies: ['AI', 'Machine Learning', 'Cloud', 'Blockchain', 'IoT', 'AR/VR'].slice(0, Math.floor(Math.random() * 4) + 2),
          competitors: ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].slice(0, Math.floor(Math.random() * 3) + 1),
          market: 'Global',
          financials: {
            totalFunding: '$' + (Math.floor(Math.random() * 500) + 50) + 'M',
            lastRound: '$' + (Math.floor(Math.random() * 100) + 10) + 'M',
            valuation: '$' + (Math.floor(Math.random() * 10) + 1) + 'B',
            revenue: '$' + (Math.floor(Math.random() * 100) + 10) + 'M',
            burnRate: '$' + (Math.floor(Math.random() * 10) + 1) + 'M/month'
          }
        });
      }, 2000); // Simulate 2-second API call
    });
  };

  const handleCreateList = () => {
    if (!newListName.trim() || !company) return;
    
    try {
      const newList = createList(newListName.trim());
      addCompanyToList(newList.id, company.id);
      setLists(getLists());
      setNewListName('');
      setShowListModal(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleAddToList = (listId: string) => {
    if (!company) return;
    
    try {
      addCompanyToList(listId, company.id);
      setLists(getLists());
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  const handleExport = () => {
    if (!company) return;
    
    const data = {
      company: company.name,
      summary: `${company.name} is a ${company.industry} company founded in ${company.founded} that ${company.businessModel.toLowerCase()}.`,
      employees: company.employees,
      founded: company.founded,
      founders: company.founders,
      businessModel: company.businessModel,
      whatTheyDo: [
        `Develops ${company.technologies.slice(0, 2).join(' and ')} solutions`,
        `Serves ${company.targetMarket.toLowerCase()}`,
        `Operates in ${company.market} market`,
        `Currently at ${company.stage} funding stage`,
        `Headquartered in ${company.headquarters}`,
        `Competes with ${company.competitors.slice(0, 2).join(' and ')}`
      ],
      keywords: [...company.technologies, ...company.competitors, company.industry, company.stage, company.targetMarket],
      derivedSignals: [
        'Careers page indicates active hiring',
        'Recent blog posts show product updates', 
        'Changelog suggests active development',
        'Multiple funding rounds completed'
      ],
      sources: [
        `https://www.crunchbase.com/organization/${company.name.toLowerCase()}`,
        `https://www.linkedin.com/company/${company.name.toLowerCase()}`,
        company.website
      ],
      scrapedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name.toLowerCase().replace(/\s+/g, '_')}_enrichment.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <div style={{ color: '#999' }}>Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <div style={{ color: '#999' }}>Company not found</div>
      </div>
    );
  }

  const summary = `${company.name} is a ${company.industry} company founded in ${company.founded} that ${company.businessModel.toLowerCase()}.`;

  const whatTheyDo = [
    `Develops ${company.technologies.slice(0, 2).join(' and ')} solutions`,
    `Serves ${company.targetMarket.toLowerCase()}`,
    `Operates in ${company.market} market`,
    `Currently at ${company.stage} funding stage`,
    `Headquartered in ${company.headquarters}`,
    `Competes with ${company.competitors.slice(0, 2).join(' and ')}`
  ];

  const keywords = [...company.technologies, ...company.competitors, company.industry, company.stage, company.targetMarket];

  const derivedSignals = [
    'Careers page indicates active hiring',
    'Recent blog posts show product updates', 
    'Changelog suggests active development',
    'Multiple funding rounds completed'
  ];

  const sources = [
    `https://www.crunchbase.com/organization/${company.name.toLowerCase()}`,
    `https://www.linkedin.com/company/${company.name.toLowerCase()}`,
    company.website
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => router.back()}
          style={{ backgroundColor: '#333', color: 'white', padding: '6px 12px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
        >
          Back
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReEnrich}
            disabled={isReEnriching}
            style={{ backgroundColor: isReEnriching ? '#555' : '#333', color: 'white', padding: '6px 12px', border: '1px solid #444', borderRadius: '4px', cursor: isReEnriching ? 'not-allowed' : 'pointer' }}
          >
            {isReEnriching ? 'Re-Enriching...' : 'Re-Enrich'}
          </button>
          <button
            onClick={handleExport}
            style={{ backgroundColor: '#333', color: 'white', padding: '6px 12px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            Export
          </button>
          <button
            onClick={() => setShowListModal(true)}
            style={{ backgroundColor: '#333', color: 'white', padding: '6px 12px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            Add to List
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{company.name}</h1>
        <p style={{ color: '#ccc', marginBottom: '15px', fontSize: '14px', lineHeight: 1.5 }}>{summary}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div>
            <div style={{ color: '#999', marginBottom: '3px' }}>Employees</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{company.employees.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '3px' }}>Founded</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{company.founded}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '3px' }}>Stage</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{company.stage}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '3px' }}>Valuation</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{company.valuation}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '3px' }}>Founders</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{company.founders.join(', ')}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '3px' }}>Business Model</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{company.businessModel}</div>
          </div>
        </div>
      </div>

      {/* What They Do */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>What They Do</h2>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0', color: '#ccc', fontSize: '14px' }}>
          {whatTheyDo.map((item, index) => (
            <li key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <span style={{ color: '#666', marginTop: '2px' }}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Keywords */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Keywords</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {keywords.map((keyword, index) => (
            <span key={index} style={{ backgroundColor: '#222', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Derived Signals */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Derived Signals</h2>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0', color: '#ccc', fontSize: '14px' }}>
          {derivedSignals.map((signal, index) => (
            <li key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <span style={{ color: '#666', marginTop: '2px' }}>•</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Sources</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px' }}>
          {sources.map((source, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#222', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
              <a 
                href={source} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#ccc', textDecoration: 'underline' }}
              >
                {source}
              </a>
            </div>
          ))}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Scraped at: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNoteStatus('');
          }}
          placeholder="Add your notes about this company..."
          style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', color: 'white', resize: 'none', minHeight: '60px' }}
        />
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleSaveNotes}
            style={{ padding: '8px 12px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Notes
          </button>
          {noteStatus && <span style={{ color: '#999', fontSize: '12px' }}>{noteStatus}</span>}
        </div>
      </div>

      {/* Add to List Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px', width: '100%', maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Add to List</h3>
              <button
                onClick={() => setShowListModal(false)}
                style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Create new list..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', color: 'white', marginBottom: '10px' }}
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                style={{ width: '100%', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: newListName.trim() ? 'pointer' : 'not-allowed' }}
              >
                Create New List
              </button>
            </div>
            
            <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Add to existing:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '120px', overflowY: 'auto' }}>
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleAddToList(list.id)}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', backgroundColor: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {list.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

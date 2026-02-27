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
  
  // Generate user-specific notes storage key
  const getNotesStorageKey = (companyId: string): string => {
    if (typeof window === 'undefined') return `vc-notes-${companyId}`;
    
    const userKey = 'vc-intelligence-user-id';
    let userId = localStorage.getItem(userKey);
    
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(userKey, userId);
    }
    
    return `vc-notes-${userId}-${companyId}`;
  };

  useEffect(() => {
    const foundCompany = companies.find(c => c.id === companyId);
    setCompany(foundCompany || null);
    setLists(getLists());
    if (typeof window !== 'undefined') {
      const notesKey = getNotesStorageKey(companyId);
      setNotes(localStorage.getItem(notesKey) || '');
      setNoteStatus('');
    }
    setLoading(false);
  }, [companyId]);

  const handleSaveNotes = () => {
    if (typeof window === 'undefined') return;
    const notesKey = getNotesStorageKey(companyId);
    localStorage.setItem(notesKey, notes);
    setNoteStatus('Notes saved');
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
      setShowListModal(false);
      setNewListName('');
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
      keywords: [...company.technologies, ...company.competitors, company.industry, company.targetMarket],
      derivedSignals: [
        'Careers page indicates active hiring',
        'Recent blog posts show product updates',
        'Changelog suggests active development',
        'Multiple funding rounds completed'
      ],
      sources: [
        { url: `https://www.crunchbase.com/organization/${company.name.toLowerCase()}`, timestamp: new Date().toISOString() },
        { url: `https://www.linkedin.com/company/${company.name.toLowerCase()}`, timestamp: new Date().toISOString() },
        { url: company.website, timestamp: new Date().toISOString() }
      ],
      scrapedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name.toLowerCase().replace(/\s+/g, '_')}_company_data.json`;
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

  const keywords = [...company.technologies, ...company.competitors, company.industry, company.targetMarket];

  const derivedSignals = [
    'Careers page indicates active hiring',
    'Recent blog posts show product updates',
    'Changelog suggests active development',
    'Multiple funding rounds completed'
  ];

  const sources = [
    { url: `https://www.crunchbase.com/organization/${company.name.toLowerCase()}`, timestamp: new Date().toISOString() },
    { url: `https://www.linkedin.com/company/${company.name.toLowerCase()}`, timestamp: new Date().toISOString() },
    { url: company.website, timestamp: new Date().toISOString() }
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
          {whatTheyDo.map((item: string, index: number) => (
            <li key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <span style={{ color: '#666', marginTop: '2px' }}>*</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Keywords */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Keywords</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {keywords.map((keyword: string, index: number) => (
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
          {derivedSignals.map((signal: string, index: number) => (
            <li key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <span style={{ color: '#666', marginTop: '2px' }}>*</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Sources</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map((source: { url: string; timestamp: string }, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#222', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#ccc', textDecoration: 'underline' }}
              >
                {source.url}
              </a>
            </div>
          ))}
          <div style={{ marginTop: '10px', color: '#666', fontSize: '12px' }}>
            Scraped at: {new Date(sources[0]?.timestamp || Date.now()).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes about this company..."
          style={{ 
            width: '100%', 
            minHeight: '100px', 
            padding: '10px', 
            backgroundColor: '#222', 
            border: '1px solid #444', 
            borderRadius: '4px', 
            color: 'white', 
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleSaveNotes}
            style={{ backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Notes
          </button>
          {noteStatus && (
            <span style={{ color: noteStatus.includes('saved') ? '#10b981' : '#ef4444', fontSize: '12px' }}>
              {noteStatus}
            </span>
          )}
        </div>
      </div>

      {/* List Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', padding: '20px', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Add to List</h3>
              <button
                onClick={() => setShowListModal(false)}
                style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                x
              </button>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name..."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  backgroundColor: '#222', 
                  border: '1px solid #444', 
                  borderRadius: '4px', 
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                style={{ 
                  backgroundColor: newListName.trim() ? '#333' : '#555', 
                  color: 'white', 
                  padding: '8px 16px', 
                  border: '1px solid #444', 
                  borderRadius: '4px', 
                  cursor: newListName.trim() ? 'pointer' : 'not-allowed',
                  marginRight: '10px'
                }}
              >
                Create List
              </button>
              <button
                onClick={() => setShowListModal(false)}
                style={{ backgroundColor: '#555', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

            {lists.length > 0 && (
              <div>
                <h4 style={{ color: 'white', marginBottom: '10px' }}>Existing Lists</h4>
                {lists.map((list: CompanyList) => (
                  <button
                    key={list.id}
                    onClick={() => handleAddToList(list.id)}
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      padding: '8px', 
                      backgroundColor: '#222', 
                      border: '1px solid #444', 
                      borderRadius: '4px', 
                      color: 'white', 
                      textAlign: 'left',
                      cursor: 'pointer',
                      marginBottom: '5px'
                    }}
                  >
                    {list.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


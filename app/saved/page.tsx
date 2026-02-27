'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getSavedCompanies, deleteSavedCompany, SavedCompany } from '@/lib/searchManager';

export default function SavedPage() {
  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>(() => getSavedCompanies());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return savedCompanies;
    
    const query = searchQuery.toLowerCase();
    return savedCompanies.filter(company => 
      company.name.toLowerCase().includes(query) ||
      company.industry.toLowerCase().includes(query) ||
      company.stage.toLowerCase().includes(query) ||
      company.description.toLowerCase().includes(query)
    );
  }, [savedCompanies, searchQuery]);

  const handleDeleteCompany = (companyId: string) => {
    if (!confirm('Are you sure you want to delete this saved company?')) return;
    
    if (deleteSavedCompany(companyId)) {
      setSavedCompanies(getSavedCompanies());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Saved Companies</h1>
        
        {/* Search Bar */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search saved companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '8px', 
              backgroundColor: '#222', 
              border: '1px solid #444', 
              borderRadius: '4px', 
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ color: '#999', fontSize: '14px' }}>
          {filteredCompanies.length} of {savedCompanies.length} companies
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: '#444', borderRadius: '50%' }}></div>
          </div>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            {savedCompanies.length === 0 ? 'No saved companies yet.' : 'No companies found matching your search.'}
          </p>
          {savedCompanies.length === 0 && (
            <Link
              href="/companies"
              style={{ display: 'inline-block', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', textDecoration: 'none' }}
            >
              Browse Companies
            </Link>
          )}
          {searchQuery && savedCompanies.length > 0 && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ display: 'inline-block', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', textDecoration: 'none', cursor: 'pointer' }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredCompanies.map((company) => (
            <div key={company.id} style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>{company.name}</h3>
                  <p style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>{company.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <span style={{ backgroundColor: '#333', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                      {company.industry}
                    </span>
                    <span style={{ backgroundColor: '#333', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                      {company.stage}
                    </span>
                    <span style={{ backgroundColor: '#333', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                      {company.employees.toLocaleString()} employees
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    <div>Founded: {company.founded}</div>
                    <div>Headquarters: {company.headquarters}</div>
                    <div>Website: <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff' }}>{company.website}</a></div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Saved on: {formatDate(company.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '15px' }}>
                  <Link
                    href={`/companies/${company.id}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 8px', backgroundColor: '#333', color: 'white', borderRadius: '3px', textDecoration: 'none', fontSize: '12px' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    style={{ color: '#ff6666', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

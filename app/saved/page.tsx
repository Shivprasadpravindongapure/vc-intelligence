'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSavedCompanies, deleteSavedCompany, SavedCompany } from '@/lib/searchManager';

export default function SavedPage() {
  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>(() => getSavedCompanies());

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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Saved Companies</h1>
      </div>

      {savedCompanies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: '#444', borderRadius: '50%' }}></div>
          </div>
          <p style={{ color: '#999', marginBottom: '20px' }}>No saved companies yet.</p>
          <Link
            href="/companies"
            style={{ display: 'inline-block', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', textDecoration: 'none' }}
          >
            Browse Companies
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {savedCompanies.map((company) => (
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
                    <span style={{ backgroundColor: '#333', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                      {company.founded}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    Saved {formatDate(company.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', marginLeft: '15px' }}>
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

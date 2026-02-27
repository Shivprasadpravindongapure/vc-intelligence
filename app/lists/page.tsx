'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { companies, Company } from '@/lib/mockData';
import {
  CompanyList,
  createList,
  deleteList,
  exportListToJSON,
  getLists,
  removeCompanyFromList
} from '@/lib/listManager';

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<CompanyList[]>(() =>
    typeof window === 'undefined' ? [] : getLists()
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState<CompanyList | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const companyNameById = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    []
  );

  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id, company])),
    []
  );

  const refreshLists = () => {
    setLists(getLists());
  };

  useEffect(() => {
    const handleStorageUpdate = () => refreshLists();
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleCreateList = () => {
    const name = newListName.trim();
    if (!name) return;
    createList(name);
    refreshLists();
    setNewListName('');
    setShowCreateModal(false);
  };

  const handleDeleteList = (listId: string) => {
    deleteList(listId);
    refreshLists();
  };

  const handleViewList = (list: CompanyList) => {
    setSelectedList(list);
    setShowViewModal(true);
  };

  const handleRemoveCompany = (listId: string, companyId: string) => {
    removeCompanyFromList(listId, companyId);
    refreshLists();
    if (selectedList) {
      setSelectedList({
        ...selectedList,
        companies: selectedList.companies.filter(id => id !== companyId)
      });
    }
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies/${companyId}`);
    setShowViewModal(false);
  };

  const getListCompanies = (list: CompanyList): Company[] => {
    return list.companies
      .map(companyId => companyById.get(companyId))
      .filter((company): company is Company => company !== undefined);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Lists</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{ backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
        >
          New List
        </button>
      </div>

      {/* Empty State */}
      {lists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: '#444', borderRadius: '50%' }}></div>
          </div>
          <p style={{ color: '#999', marginBottom: '20px' }}>No lists yet. Create one to start organizing companies.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {lists.map((list) => (
            <div key={list.id} style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px' }}>
              <h3 style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{list.name}</h3>
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>{list.companies.length} companies</p>
              <p style={{ color: '#777', fontSize: '12px', marginBottom: '10px' }}>
                {list.companies.length > 0
                  ? list.companies
                      .slice(0, 3)
                      .map((companyId) => companyNameById.get(companyId) || companyId)
                      .join(', ')
                  : 'No companies yet'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleViewList(list)}
                  style={{ backgroundColor: '#333', color: 'white', padding: '6px 10px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  View List
                </button>
                <button
                  onClick={() => exportListToJSON(list)}
                  style={{ backgroundColor: '#333', color: 'white', padding: '6px 10px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Export
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  style={{ backgroundColor: '#222', color: '#fca5a5', padding: '6px 10px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Created {new Date(list.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>Create New List</h2>
            <input
              type="text"
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', color: 'white', marginBottom: '15px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                style={{ flex: 1, backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: newListName.trim() ? 'pointer' : 'not-allowed' }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewListName('');
                }}
                style={{ flex: 1, backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View List Modal */}
      {showViewModal && selectedList && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', padding: '20px', width: '100%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>{selectedList.name}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '15px', color: '#999', fontSize: '14px' }}>
              {selectedList.companies.length} companies • Created {new Date(selectedList.createdAt).toLocaleDateString()}
            </div>

            {selectedList.companies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#444', borderRadius: '50%' }}></div>
                </div>
                <p>No companies in this list yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {getListCompanies(selectedList).map((company: Company) => (
                  <div 
                    key={company.id} 
                    style={{ 
                      backgroundColor: '#222', 
                      border: '1px solid #333', 
                      borderRadius: '6px', 
                      padding: '15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleCompanyClick(company.id)}>
                      <h3 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '16px' }}>{company.name}</h3>
                      <p style={{ color: '#999', margin: '0 0 5px 0', fontSize: '12px' }}>{company.industry}</p>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#777' }}>
                        <span>{company.employees.toLocaleString()} employees</span>
                        <span>{company.stage}</span>
                        <span>{company.founded}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleCompanyClick(company.id)}
                        style={{ backgroundColor: '#333', color: 'white', padding: '6px 12px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveCompany(selectedList.id, company.id)}
                        style={{ backgroundColor: '#222', color: '#fca5a5', padding: '6px 12px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => exportListToJSON(selectedList)}
                style={{ backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
              >
                Export List
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ backgroundColor: '#555', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

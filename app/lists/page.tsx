'use client';

import { useState } from 'react';

type LocalList = {
  id: string;
  name: string;
  companies: string[];
  createdAt: string;
};

export default function ListsPage() {
  const [lists, setLists] = useState<LocalList[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        companies: [],
        createdAt: new Date().toISOString()
      };
      setLists([...lists, newList]);
      setNewListName('');
      setShowCreateModal(false);
    }
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
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Update search query when URL params change
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'black', color: 'white' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', backgroundColor: '#111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', backgroundColor: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>VC</span>
            </div>
            <span style={{ color: 'white', fontWeight: 'bold' }}>VC Intelligence</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px' }}>
          <Link href="/companies" style={{ display: 'block', padding: '10px', color: pathname === '/companies' ? 'white' : '#999', textDecoration: 'none', marginBottom: '5px' }}>
            Companies
          </Link>
          <Link href="/lists" style={{ display: 'block', padding: '10px', color: pathname === '/lists' ? 'white' : '#999', textDecoration: 'none', marginBottom: '5px' }}>
            Lists
          </Link>
          <Link href="/saved" style={{ display: 'block', padding: '10px', color: pathname === '/saved' ? 'white' : '#999', textDecoration: 'none' }}>
            Saved
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Search Bar */}
        <div style={{ backgroundColor: '#111', borderBottom: '1px solid #333', padding: '15px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
            />
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {children}
        </div>

        <footer style={{ borderTop: '1px solid #333', padding: '10px 20px', color: '#999', fontSize: '12px', textAlign: 'center' }}>
          Made by SD'
        </footer>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<div style={{ color: '#999', padding: '20px' }}>Loading...</div>}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}

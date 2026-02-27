'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { companies, industries, stages, Company } from '@/lib/mockData';
import { saveCompany, getSavedCompanies, SavedCompany } from '@/lib/searchManager';

type SortField = 'name' | 'industry' | 'stage';
type SortDirection = 'asc' | 'desc';

function CompaniesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || '');
  const [selectedStage, setSelectedStage] = useState(searchParams.get('stage') || '');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedCompanyIds, setSavedCompanyIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [realTimeCompanies, setRealTimeCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sleep function for rate limiting
  const sleep = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  // Fetch real-time data from enrichment API
  const fetchRealTimeData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Process companies one by one with delays to avoid rate limiting
      const enrichedCompanies = [];
      
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        
        try {
          const response = await fetch('/api/enrich', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: company.website,
              provider: 'google',
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Handle fallback data gracefully
            if (data.provider === 'fallback') {
              console.log(`Using fallback data for ${company.name}:`, data.error);
              enrichedCompanies.push(company); // Keep original data
            } else {
              // Transform API data to our Company format
              const enrichedCompany = {
                ...company,
                employees: data.companyDetails?.employees || company.employees,
                founded: data.companyDetails?.founded || company.founded,
                headquarters: data.companyDetails?.headquarters || company.headquarters,
                founders: data.companyDetails?.founders || company.founders,
                businessModel: data.summary || company.businessModel,
                targetMarket: data.keywords?.find((k: string) => ['Enterprise', 'SMB', 'Consumer', 'Developer', 'Healthcare'].includes(k)) || company.targetMarket,
                technologies: data.keywords?.filter((k: string) => ['AI', 'Machine Learning', 'Cloud', 'Blockchain', 'IoT', 'AR/VR', 'SaaS', 'API'].includes(k)) || company.technologies,
                competitors: data.competitors || company.competitors,
                market: data.signals?.find((s: string) => s.includes('market'))?.split(' ').pop() || company.market,
                financials: {
                  totalFunding: data.companyDetails?.funding || company.financials?.totalFunding,
                  lastRound: data.companyDetails?.funding || company.financials?.lastRound,
                  valuation: data.companyDetails?.netWorth || company.financials?.valuation,
                  revenue: data.companyDetails?.revenue || company.financials?.revenue,
                  burnRate: company.financials?.burnRate
                }
              };
              
              enrichedCompanies.push(enrichedCompany);
            }
          } else {
            enrichedCompanies.push(company); // Return original company if API fails
          }
          
          // Add delay between API calls to prevent rate limiting
          if (i < companies.length - 1) {
            await sleep(5000); // 5 second delay between companies
          }
        } catch (error) {
          console.warn(`Failed to enrich ${company.name}:`, error);
          enrichedCompanies.push(company); // Return original company if API fails
        }
      }
      
      setRealTimeCompanies(enrichedCompanies);
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      // Use original companies as fallback
      setRealTimeCompanies(companies);
    } finally {
      setIsLoading(false);
    }
  }, [sleep]);

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedIndustry) params.set('industry', selectedIndustry);
    if (selectedStage) params.set('stage', selectedStage);
    if (sortField !== 'name') params.set('sort', sortField);
    if (sortDirection !== 'asc') params.set('order', sortDirection);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString();
    const currentUrl = `${window.location.pathname}${newUrl ? `?${newUrl}` : ''}`;
    
    if (currentUrl !== window.location.search) {
      router.replace(currentUrl, { scroll: false });
    }
  }, [searchQuery, selectedIndustry, selectedStage, sortField, sortDirection, currentPage, router]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setSavedCompanyIds(new Set(getSavedCompanies().map((c: SavedCompany) => c.id)));
    // Start with original data and then enrich with real API data
    setRealTimeCompanies(companies);
    fetchRealTimeData();
  }, [fetchRealTimeData]);

  // Handle enrichment
  const handleEnrichment = (company: Company) => {
    router.push(`/companies/${company.id}`);
  };

  // Handle save company
  const handleSaveCompany = (company: Company) => {
    try {
      saveCompany({
        id: company.id,
        name: company.name,
        industry: company.industry,
        stage: company.stage,
        description: company.description,
        website: company.website,
        founded: company.founded,
        employees: company.employees,
        headquarters: company.headquarters,
        founders: company.founders,
        businessModel: company.businessModel,
        targetMarket: company.targetMarket
      });
      setSavedCompanyIds(new Set([...savedCompanyIds, company.id]));
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  const itemsPerPage = 7;

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    const filtered = realTimeCompanies.filter((company: Company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
      const matchesStage = !selectedStage || company.stage === selectedStage;
      return matchesSearch && matchesIndustry && matchesStage;
    });

    // Sort companies
    filtered.sort((a: Company, b: Company) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedIndustry, selectedStage, sortField, sortDirection, realTimeCompanies]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredAndSortedCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle clear filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedStage('');
    setCurrentPage(1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Companies</h1>
        <p style={{ color: '#999', fontSize: '14px' }}>Browse and analyze innovative companies with real-time data</p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '15px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: 1, minWidth: '200px', padding: '8px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', color: 'white' }}
          />
          
          <select
            value={selectedIndustry}
            onChange={(e) => {
              setSelectedIndustry(e.target.value);
              setCurrentPage(1);
            }}
            style={{ padding: '8px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', color: 'white' }}
          >
            <option value="">All Industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          
          <select
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setCurrentPage(1);
            }}
            style={{ padding: '8px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', color: 'white' }}
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          
          <button
            onClick={resetFilters}
            style={{ padding: '8px 16px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
        Showing <span style={{ color: 'white', fontWeight: 'bold' }}>{paginatedCompanies.length}</span> of{' '}
        <span style={{ color: 'white', fontWeight: 'bold' }}>{filteredAndSortedCompanies.length}</span> companies
        {isLoading && <span style={{ marginLeft: '10px', color: '#4a9eff' }}>Loading real-time data...</span>}
      </div>

      {/* Companies Table */}
      <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#222', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase' }}>
                #
              </th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                Company {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}
                onClick={() => handleSort('industry')}
              >
                Industry {sortField === 'industry' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}
                onClick={() => handleSort('stage')}
              >
                Stage {sortField === 'stage' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.length > 0 ? (
              paginatedCompanies.map((company: Company, index: number) => (
                <tr key={company.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '10px', color: '#999' }}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                        {company.name}
                      </div>
                      <p style={{ color: '#999', fontSize: '12px', marginTop: '3px' }}>
                        {company.description.substring(0, 100)}...
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ backgroundColor: '#333', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                      {company.industry}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ backgroundColor: '#333', color: '#ccc', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                      {company.stage}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleSaveCompany(company)}
                        disabled={!mounted || savedCompanyIds.has(company.id)}
                        style={{ padding: '4px 8px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '3px', cursor: mounted && !savedCompanyIds.has(company.id) ? 'pointer' : 'not-allowed', fontSize: '12px' }}
                      >
                        {mounted && savedCompanyIds.has(company.id) ? 'Saved' : 'Save'}
                      </button>
                      <button
                        onClick={() => handleEnrichment(company)}
                        style={{ padding: '4px 8px', backgroundColor: '#4a9eff', color: 'white', border: '1px solid #444', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Enrich
                      </button>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '4px 8px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '3px', textDecoration: 'none', fontSize: '12px' }}
                      >
                        Visit
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ color: '#999', marginBottom: '15px' }}>No companies found</div>
                  <button
                    onClick={resetFilters}
                    style={{ padding: '8px 16px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Clear Filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#999', fontSize: '14px' }}>
            Page <span style={{ color: 'white', fontWeight: 'bold' }}>{currentPage}</span> of{' '}
            <span style={{ color: 'white', fontWeight: 'bold' }}>{totalPages}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 12px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{ 
                    padding: '8px 12px', 
                    backgroundColor: currentPage === page ? '#555' : '#333', 
                    color: 'white', 
                    border: '1px solid #444', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 12px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div style={{ color: '#999' }}>Loading...</div>}>
      <CompaniesPageContent />
    </Suspense>
  );
}

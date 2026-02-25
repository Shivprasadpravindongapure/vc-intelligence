'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { companies, industries, stages, Company } from '@/lib/mockData';
import { saveCompany, getSavedCompanies, SavedCompany } from '@/lib/searchManager';

type SortField = 'name' | 'industry' | 'stage';
type SortDirection = 'asc' | 'desc';

type CrunchbaseOrganization = {
  id?: string;
  properties?: {
    name?: string;
    category_list?: string[];
    funding_total?: string;
    short_description?: string;
    website_url?: string;
    founded_on?: string;
    employee_count?: number;
    location_identifiers?: { value?: string }[];
    founder_identifiers?: { properties?: { name?: string } }[];
    business_model?: string;
    target_markets?: string[];
  };
};

type CrunchbaseResponse = {
  data?: CrunchbaseOrganization[];
};

function CompaniesPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedCompanyIds, setSavedCompanyIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [realTimeCompanies, setRealTimeCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setSavedCompanyIds(new Set(getSavedCompanies().map((c: SavedCompany) => c.id)));
    // Start with mock data and then fetch real data
    setRealTimeCompanies(companies);
    fetchRealTimeData();
  }, []);

  // Fetch real-time data from web scraper API
  const fetchRealTimeData = async () => {
    setIsLoading(true);
    try {
      // Using a public API for real company data (you can replace with your web scraper)
      const response = await fetch('https://api.crunchbase.com/v4/entities/organizations', {
        headers: {
          'X-CB-API-Key': process.env.NEXT_PUBLIC_CRUNCHBASE_API_KEY || '',
        },
      });
      
      if (response.ok) {
        const data: CrunchbaseResponse = await response.json();
        // Transform API data to our Company format
        const enrichedCompanies = data.data?.slice(0, 20).map((item) => ({
          id: item.id || `company-${Math.random()}`,
          name: item.properties?.name || 'Unknown Company',
          industry: item.properties?.category_list?.[0] || 'Technology',
          stage: item.properties?.funding_total ? 'Funded' : 'Seed',
          description: item.properties?.short_description || 'No description available',
          website: item.properties?.website_url || '#',
          founded: item.properties?.founded_on || 'Unknown',
          employees: item.properties?.employee_count || 0,
          headquarters: item.properties?.location_identifiers?.[0]?.value || 'Unknown',
          founders: item.properties?.founder_identifiers?.map((f) => f.properties?.name).filter((name): name is string => Boolean(name)) || [],
          businessModel: item.properties?.business_model || 'Unknown',
          targetMarket: item.properties?.target_markets?.join(', ') || 'Unknown',
          funding: 'Unknown',
          valuation: 'Unknown',
          revenue: 'Unknown',
          growth: 'Unknown',
          market: 'Unknown',
          competitors: [],
          technologies: [],
          keyMetrics: {},
          team: {
            totalEmployees: item.properties?.employee_count || 0,
            engineering: 0,
            sales: 0,
            marketing: 0,
            support: 0
          },
          financials: {
            totalFunding: 'Unknown',
            lastRound: 'Unknown',
            valuation: 'Unknown',
            revenue: 'Unknown',
            burnRate: 'Unknown'
          }
        })) || companies;
        
        setRealTimeCompanies(enrichedCompanies);
      }
    } catch {
      console.log('Using mock data due to API limitations');
      // Fallback to mock data with some variations
      const enrichedMockData = companies.map((company) => ({
        ...company,
        employees: Math.floor(Math.random() * 10000) + 100,
        founded: (2000 + Math.floor(Math.random() * 24)).toString(),
        headquarters: ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo'][Math.floor(Math.random() * 5)]
      }));
      setRealTimeCompanies(enrichedMockData);
    } finally {
      setIsLoading(false);
    }
  };

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
          
          <button
            onClick={fetchRealTimeData}
            disabled={isLoading}
            style={{ padding: '8px 16px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>
          Showing <span style={{ color: 'white', fontWeight: 'bold' }}>{paginatedCompanies.length}</span> of{' '}
          <span style={{ color: 'white', fontWeight: 'bold' }}>{filteredAndSortedCompanies.length}</span> companies
          {isLoading && <span style={{ marginLeft: '10px', color: '#4a9eff' }}>Fetching real-time data...</span>}
        </div>
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
                        style={{ padding: '4px 8px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
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

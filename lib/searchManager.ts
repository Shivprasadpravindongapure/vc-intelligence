export interface SavedSearch {
  id: string;
  name: string;
  searchQuery: string;
  selectedIndustry: string;
  selectedStage: string;
  createdAt: string;
}

export interface SavedCompany {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  website: string;
  founded: string;
  employees: number;
  headquarters: string;
  founders: string[];
  businessModel: string;
  targetMarket: string;
  createdAt: string;
}

export interface SavedSearchesState {
  searches: SavedSearch[];
}

export interface SavedCompaniesState {
  companies: SavedCompany[];
}

// Generate user-specific storage key
const getUserStorageKey = (baseKey: string): string => {
  if (typeof window === 'undefined') return baseKey;
  
  // Check if this is a new user (first visit)
  const userKey = 'vc-intelligence-user-id';
  let userId = localStorage.getItem(userKey);
  
  if (!userId) {
    // Generate new user ID for first-time visitors
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(userKey, userId);
    
    // Clear any existing data from previous users
    localStorage.removeItem(baseKey);
  }
  
  return `${baseKey}-${userId}`;
};

// Get all saved searches from localStorage
export const getSavedSearches = (): SavedSearch[] => {
  if (typeof window === 'undefined') return [];
  
  const storageKey = getUserStorageKey('vc-intelligence-saved-searches');
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.searches || [];
  } catch (error) {
    console.error('Error loading saved searches from localStorage:', error);
    return [];
  }
};

// Get all saved companies from localStorage
export const getSavedCompanies = (): SavedCompany[] => {
  if (typeof window === 'undefined') return [];
  
  const storageKey = getUserStorageKey('vc-intelligence-saved-companies');
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.companies || [];
  } catch (error) {
    console.error('Error loading saved companies from localStorage:', error);
    return [];
  }
};

// Save all searches to localStorage
export const saveSavedSearches = (searches: SavedSearch[]): void => {
  if (typeof window === 'undefined') return;
  
  const storageKey = getUserStorageKey('vc-intelligence-saved-searches');
  
  try {
    const state: SavedSearchesState = { searches };
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving searches to localStorage:', error);
  }
};

// Save all companies to localStorage
export const saveSavedCompanies = (companies: SavedCompany[]): void => {
  if (typeof window === 'undefined') return;
  
  const storageKey = getUserStorageKey('vc-intelligence-saved-companies');
  
  try {
    const state: SavedCompaniesState = { companies };
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving companies to localStorage:', error);
  }
};

// Create a new saved search
export const createSavedSearch = (
  name: string,
  searchQuery: string,
  selectedIndustry: string,
  selectedStage: string
): SavedSearch => {
  const searches = getSavedSearches();
  const newSearch: SavedSearch = {
    id: Date.now().toString(),
    name,
    searchQuery,
    selectedIndustry,
    selectedStage,
    createdAt: new Date().toISOString()
  };
  
  const updatedSearches = [...searches, newSearch];
  saveSavedSearches(updatedSearches);
  
  return newSearch;
};

// Save a company to saved companies
export const saveCompany = (company: {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  website: string;
  founded: string;
  employees: number;
  headquarters: string;
  founders: string[];
  businessModel: string;
  targetMarket: string;
}): SavedCompany => {
  const companies = getSavedCompanies();
  
  // Check if company is already saved
  if (companies.some(c => c.id === company.id)) {
    throw new Error('Company is already saved');
  }
  
  const newSavedCompany: SavedCompany = {
    ...company,
    createdAt: new Date().toISOString()
  };
  
  const updatedCompanies = [...companies, newSavedCompany];
  saveSavedCompanies(updatedCompanies);
  
  return newSavedCompany;
};

// Delete a saved search
export const deleteSavedSearch = (searchId: string): boolean => {
  const searches = getSavedSearches();
  const filteredSearches = searches.filter(search => search.id !== searchId);
  
  if (filteredSearches.length === searches.length) return false; // No search found to delete
  
  saveSavedSearches(filteredSearches);
  return true;
};

// Delete a saved company
export const deleteSavedCompany = (companyId: string): boolean => {
  const companies = getSavedCompanies();
  const filteredCompanies = companies.filter(company => company.id !== companyId);
  
  if (filteredCompanies.length === companies.length) return false; // No company found to delete
  
  saveSavedCompanies(filteredCompanies);
  return true;
};

// Check if a company is saved
export const isCompanySaved = (companyId: string): boolean => {
  const companies = getSavedCompanies();
  return companies.some(company => company.id === companyId);
};

// Apply saved search to URL parameters
export const applySavedSearch = (search: SavedSearch): void => {
  const params = new URLSearchParams();
  
  if (search.searchQuery) {
    params.set('search', search.searchQuery);
  }
  
  if (search.selectedIndustry) {
    params.set('industry', search.selectedIndustry);
  }
  
  if (search.selectedStage) {
    params.set('stage', search.selectedStage);
  }
  
  // Navigate to companies page with search parameters
  const url = `/companies${params.toString() ? '?' + params.toString() : ''}`;
  window.location.href = url;
};

export interface SavedSearch {
  id: string;
  name: string;
  searchQuery: string;
  selectedIndustry: string;
  selectedStage: string;
  createdAt: string;
}

export interface SavedSearchesState {
  searches: SavedSearch[];
}

const STORAGE_KEY = 'vc-intelligence-saved-searches';

// Get all saved searches from localStorage
export const getSavedSearches = (): SavedSearch[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.searches || [];
  } catch (error) {
    console.error('Error loading saved searches from localStorage:', error);
    return [];
  }
};

// Save all searches to localStorage
export const saveSavedSearches = (searches: SavedSearch[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const state: SavedSearchesState = { searches };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving searches to localStorage:', error);
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

// Delete a saved search
export const deleteSavedSearch = (searchId: string): boolean => {
  const searches = getSavedSearches();
  const filteredSearches = searches.filter(search => search.id !== searchId);
  
  if (filteredSearches.length === searches.length) return false; // No search found to delete
  
  saveSavedSearches(filteredSearches);
  return true;
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

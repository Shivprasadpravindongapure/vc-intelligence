export interface CompanyList {
  id: string;
  name: string;
  companies: string[];
  createdAt: string;
}

export interface ListsState {
  lists: CompanyList[];
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

// Get all lists from localStorage
export const getLists = (): CompanyList[] => {
  if (typeof window === 'undefined') return [];
  
  const storageKey = getUserStorageKey('vc-intelligence-lists');
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.lists || [];
  } catch (error) {
    console.error('Error loading lists from localStorage:', error);
    return [];
  }
};

// Save all lists to localStorage
export const saveLists = (lists: CompanyList[]): void => {
  if (typeof window === 'undefined') return;
  
  const storageKey = getUserStorageKey('vc-intelligence-lists');
  
  try {
    const state: ListsState = { lists };
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving lists to localStorage:', error);
  }
};

// Create a new list
export const createList = (name: string): CompanyList => {
  const lists = getLists();
  const newList: CompanyList = {
    id: Date.now().toString(),
    name,
    companies: [],
    createdAt: new Date().toISOString()
  };
  
  const updatedLists = [...lists, newList];
  saveLists(updatedLists);
  
  return newList;
};

// Add company to list
export const addCompanyToList = (listId: string, companyId: string): boolean => {
  const lists = getLists();
  const listIndex = lists.findIndex(list => list.id === listId);
  
  if (listIndex === -1) return false;
  
  // Check if company already in list
  if (lists[listIndex].companies.includes(companyId)) {
    return false; // Already exists
  }
  
  lists[listIndex].companies.push(companyId);
  saveLists(lists);
  
  return true;
};

// Remove company from list
export const removeCompanyFromList = (listId: string, companyId: string): boolean => {
  const lists = getLists();
  const listIndex = lists.findIndex(list => list.id === listId);
  
  if (listIndex === -1) return false;
  
  lists[listIndex].companies = lists[listIndex].companies.filter(id => id !== companyId);
  saveLists(lists);
  
  return true;
};

// Delete entire list
export const deleteList = (listId: string): boolean => {
  const lists = getLists();
  const filteredLists = lists.filter(list => list.id !== listId);
  
  if (filteredLists.length === lists.length) return false; // No list found to delete
  
  saveLists(filteredLists);
  return true;
};

// Export list to JSON
export const exportListToJSON = (list: CompanyList): void => {
  const dataStr = JSON.stringify(list, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${list.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_companies.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

import { api, isApiAvailable } from './api';

const CURRENT_USER_KEY = 'manga_tracker_current_user';
const USERS_KEY = 'manga_tracker_users';

// Fallback to localStorage if API is not available
const getLocalStorageUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalStorageUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Keep current user in localStorage (client-side preference)
export const getCurrentUser = () => {
  try {
    return localStorage.getItem(CURRENT_USER_KEY) || 'default';
  } catch (error) {
    console.error('Error reading current user:', error);
    return 'default';
  }
};

export const setCurrentUser = (username) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, username);
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

// Backend API calls with localStorage fallback
export const getAllUsers = async () => {
  try {
    return await api.getAllUsers();
  } catch (error) {
    console.error('Error fetching users from API, using localStorage fallback:', error);
    const localUsers = getLocalStorageUsers();
    if (localUsers.length === 0) {
      // Initialize with default user
      saveLocalStorageUsers(['default']);
      return ['default'];
    }
    return localUsers;
  }
};

// Fallback to localStorage for manga lists
const getLocalStorageMangaList = (username) => {
  try {
    const key = `manga_tracker_list_${username}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalStorageMangaList = (username, mangaList) => {
  try {
    const key = `manga_tracker_list_${username}`;
    localStorage.setItem(key, JSON.stringify(mangaList));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getUserMangaList = async (username) => {
  try {
    const list = await api.getUserMangaList(username);
    // Also save to localStorage as backup
    saveLocalStorageMangaList(username, list);
    return list;
  } catch (error) {
    console.error('Error fetching user manga list from API, using localStorage fallback:', error);
    // Fallback to localStorage
    return getLocalStorageMangaList(username);
  }
};

export const saveUserMangaList = async (username, mangaList) => {
  // Always save to localStorage first for immediate availability
  saveLocalStorageMangaList(username, mangaList);
  
  try {
    await api.saveUserMangaList(username, mangaList);
    return true;
  } catch (error) {
    console.error('Error saving user manga list to API, using localStorage only:', error);
    // Already saved to localStorage above, so return true
    return true;
  }
};

export const addUser = async (username) => {
  try {
    await api.createUser(username);
    // Also save to localStorage as backup
    const localUsers = getLocalStorageUsers();
    if (!localUsers.includes(username)) {
      localUsers.push(username);
      saveLocalStorageUsers(localUsers);
    }
    return true;
  } catch (error) {
    console.error('Error creating user via API, trying localStorage fallback:', error);
    
    // Fallback to localStorage if API fails
    if (!isApiAvailable() || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const localUsers = getLocalStorageUsers();
      if (localUsers.includes(username)) {
        return false; // Already exists
      }
      localUsers.push(username);
      saveLocalStorageUsers(localUsers);
      
      // Initialize empty list for new user in localStorage
      const key = `manga_tracker_list_${username}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
      return true;
    }
    
    if (error.message.includes('already exists') || error.message.includes('409')) {
      return false;
    }
    throw error;
  }
};

export const getUserStats = async (username) => {
  try {
    return await api.getUserStats(username);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total: 0,
      reading: 0,
      completed: 0,
      dropped: 0,
      onHold: 0,
      avgRating: '0.0'
    };
  }
};


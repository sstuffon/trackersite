import { getCurrentUser, getUserMangaList, saveUserMangaList } from './userStorage';
import { isApiAvailable } from './api';

// Fallback to localStorage if API is not available
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

export const getTrackedManga = async () => {
  const currentUser = getCurrentUser();
  try {
    return await getUserMangaList(currentUser);
  } catch (error) {
    console.error('Error fetching manga from API, using localStorage fallback:', error);
    return getLocalStorageMangaList(currentUser);
  }
};

export const saveTrackedManga = async (mangaList) => {
  const currentUser = getCurrentUser();
  try {
    const result = await saveUserMangaList(currentUser, mangaList);
    // Also save to localStorage as backup
    saveLocalStorageMangaList(currentUser, mangaList);
    return result;
  } catch (error) {
    console.error('Error saving manga to API, using localStorage fallback:', error);
    saveLocalStorageMangaList(currentUser, mangaList);
    return true;
  }
};

export const addManga = async (manga) => {
  const list = await getTrackedManga();
  // Check if already exists
  if (list.find(m => m.mal_id === manga.mal_id)) {
    return false; // Already exists
  }
  
  const newManga = {
    ...manga,
    userRating: 0,
    chaptersRead: 0,
    status: 'reading',
    comments: '',
    addedDate: new Date().toISOString()
  };
  
  list.push(newManga);
  await saveTrackedManga(list);
  return true;
};

export const updateManga = async (malId, updates) => {
  const list = await getTrackedManga();
  const index = list.findIndex(m => m.mal_id === malId);
  
  if (index === -1) return false;
  
  list[index] = { ...list[index], ...updates };
  await saveTrackedManga(list);
  return true;
};

export const removeManga = async (malId) => {
  const list = await getTrackedManga();
  const filtered = list.filter(m => m.mal_id !== malId);
  const originalLength = list.length;
  await saveTrackedManga(filtered);
  return filtered.length !== originalLength;
};


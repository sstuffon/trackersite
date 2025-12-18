import { getCurrentUser, getUserMangaList, saveUserMangaList } from './userStorage';

export const getTrackedManga = () => {
  const currentUser = getCurrentUser();
  return getUserMangaList(currentUser);
};

export const saveTrackedManga = (mangaList) => {
  const currentUser = getCurrentUser();
  saveUserMangaList(currentUser, mangaList);
};

export const addManga = (manga) => {
  const list = getTrackedManga();
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
  saveTrackedManga(list);
  return true;
};

export const updateManga = (malId, updates) => {
  const list = getTrackedManga();
  const index = list.findIndex(m => m.mal_id === malId);
  
  if (index === -1) return false;
  
  list[index] = { ...list[index], ...updates };
  saveTrackedManga(list);
  return true;
};

export const removeManga = (malId) => {
  const list = getTrackedManga();
  const filtered = list.filter(m => m.mal_id !== malId);
  saveTrackedManga(filtered);
  return filtered.length !== list.length;
};


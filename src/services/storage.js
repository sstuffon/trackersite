import { getCurrentUser, getUserMangaList, saveUserMangaList } from './userStorage';

export const getTrackedManga = async () => {
  const currentUser = getCurrentUser();
  return await getUserMangaList(currentUser);
};

export const saveTrackedManga = async (mangaList) => {
  const currentUser = getCurrentUser();
  return await saveUserMangaList(currentUser, mangaList);
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


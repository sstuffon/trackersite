import { api } from './api';

const CURRENT_USER_KEY = 'manga_tracker_current_user';

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

// Backend API calls
export const getAllUsers = async () => {
  try {
    return await api.getAllUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to default user if API fails
    return ['default'];
  }
};

export const getUserMangaList = async (username) => {
  try {
    return await api.getUserMangaList(username);
  } catch (error) {
    console.error('Error fetching user manga list:', error);
    return [];
  }
};

export const saveUserMangaList = async (username, mangaList) => {
  try {
    await api.saveUserMangaList(username, mangaList);
    return true;
  } catch (error) {
    console.error('Error saving user manga list:', error);
    return false;
  }
};

export const addUser = async (username) => {
  try {
    await api.createUser(username);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('already exists')) {
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


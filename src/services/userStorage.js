const USERS_KEY = 'manga_tracker_users';
const CURRENT_USER_KEY = 'manga_tracker_current_user';

export const getAllUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
};

export const saveAllUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

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

export const getUserMangaList = (username) => {
  try {
    const key = `manga_tracker_list_${username}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading user manga list:', error);
    return [];
  }
};

export const saveUserMangaList = (username, mangaList) => {
  try {
    const key = `manga_tracker_list_${username}`;
    localStorage.setItem(key, JSON.stringify(mangaList));
    
    // Update users list
    const users = getAllUsers();
    if (!users.includes(username)) {
      users.push(username);
      saveAllUsers(users);
    }
  } catch (error) {
    console.error('Error saving user manga list:', error);
  }
};

export const addUser = (username) => {
  const users = getAllUsers();
  if (!users.includes(username)) {
    users.push(username);
    saveAllUsers(users);
    // Initialize empty list for new user
    saveUserMangaList(username, []);
    return true;
  }
  return false;
};

export const getUserStats = (username) => {
  const list = getUserMangaList(username);
  return {
    total: list.length,
    reading: list.filter(m => m.status === 'reading').length,
    completed: list.filter(m => m.status === 'completed').length,
    dropped: list.filter(m => m.status === 'dropped').length,
    onHold: list.filter(m => m.status === 'on hold').length,
    avgRating: list.length > 0 
      ? (list.reduce((sum, m) => sum + (m.userRating || 0), 0) / list.length).toFixed(1)
      : '0.0'
  };
};


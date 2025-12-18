// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tracker-api.vercel.app';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// User management
export const api = {
  // Get all users
  getAllUsers: async () => {
    return await apiCall('/api/users');
  },

  // Create new user
  createUser: async (username) => {
    return await apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  // Get user's manga list
  getUserMangaList: async (username) => {
    return await apiCall(`/api/users/${username}/manga`);
  },

  // Save user's manga list
  saveUserMangaList: async (username, mangaList) => {
    return await apiCall(`/api/users/${username}/manga`, {
      method: 'POST',
      body: JSON.stringify(mangaList),
    });
  },

  // Get user stats
  getUserStats: async (username) => {
    return await apiCall(`/api/users/${username}/stats`);
  },

  // Health check
  healthCheck: async () => {
    return await apiCall('/api/health');
  },
};


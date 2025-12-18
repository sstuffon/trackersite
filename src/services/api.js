// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trackerlist-api.vercel.app';

// Check if API is available
let apiAvailable = true;

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
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP error! status: ${response.status}` };
      }
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    apiAvailable = true;
    return await response.json();
  } catch (error) {
    // If it's a network error, mark API as unavailable
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      apiAvailable = false;
    }
    console.error('API call error:', error);
    throw error;
  }
}

export const isApiAvailable = () => apiAvailable;

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

  // Get all ratings for a manga across all users
  getMangaRatings: async (malId) => {
    return await apiCall(`/api/manga/${malId}/ratings`);
  },
};


import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting: 3 requests per second, 60 per minute
let lastRequestTime = 0;
const minRequestInterval = 350; // milliseconds between requests

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const rateLimitedRequest = async (url) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < minRequestInterval) {
    await delay(minRequestInterval - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  return axios.get(url);
};

export const searchManga = async (query) => {
  try {
    const response = await rateLimitedRequest(
      `${JIKAN_BASE_URL}/manga?q=${encodeURIComponent(query)}&limit=20`
    );
    
    // Filter for English titles only and format the data
    const results = response.data.data
      .map(manga => {
        // Find English title from various sources
        let englishTitle = manga.title_english;
        
        // If no direct English title, check the titles array
        if (!englishTitle && manga.titles) {
          const englishTitleObj = manga.titles.find(t => t.type === 'English');
          if (englishTitleObj) {
            englishTitle = englishTitleObj.title;
          }
        }
        
        // Return null if no English title found (will be filtered out)
        if (!englishTitle) {
          return null;
        }
        
        return {
          mal_id: manga.mal_id,
          title: englishTitle, // Always use English title
          title_japanese: manga.title_japanese,
          synopsis: manga.synopsis,
          chapters: manga.chapters || 0,
          score: manga.score,
          images: manga.images,
          type: manga.type,
          status: manga.status,
          published: manga.published
        };
      })
      .filter(manga => manga !== null); // Remove entries without English titles
    
    return results;
  } catch (error) {
    console.error('Error searching manga:', error);
    throw error;
  }
};

export const getMangaById = async (malId) => {
  try {
    const response = await rateLimitedRequest(
      `${JIKAN_BASE_URL}/manga/${malId}`
    );
    
    const manga = response.data.data;
    
    // Find English title
    let englishTitle = manga.title_english;
    if (!englishTitle && manga.titles) {
      const englishTitleObj = manga.titles.find(t => t.type === 'English');
      if (englishTitleObj) {
        englishTitle = englishTitleObj.title;
      }
    }
    
    // If no English title, return null (caller should handle this)
    if (!englishTitle) {
      return null;
    }
    
    return {
      mal_id: manga.mal_id,
      title: englishTitle, // Always use English title
      title_japanese: manga.title_japanese,
      synopsis: manga.synopsis,
      chapters: manga.chapters || 0,
      score: manga.score,
      images: manga.images,
      type: manga.type,
      status: manga.status,
      published: manga.published
    };
  } catch (error) {
    console.error('Error fetching manga:', error);
    throw error;
  }
};


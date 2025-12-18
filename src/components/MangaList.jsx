import { useState, useEffect, useRef } from 'react';
import { updateManga, removeManga } from '../services/storage';
import { api } from '../services/api';
import { getCurrentUser } from '../services/userStorage';
import './MangaList.css';

const MangaList = ({ mangaList, onUpdate, scrollToId }) => {
  const [editingId, setEditingId] = useState(null);
  const [localManga, setLocalManga] = useState(mangaList);
  const [otherUsersRatings, setOtherUsersRatings] = useState({});
  const saveTimeouts = useRef({});

  useEffect(() => {
    if (scrollToId) {
      const element = document.getElementById(`manga-${scrollToId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToId]);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalManga(mangaList);
  }, [mangaList]);

  // Fetch other users' ratings for all manga
  useEffect(() => {
    const fetchOtherUsersRatings = async () => {
      const currentUser = getCurrentUser();
      const ratingsMap = {};
      
      for (const manga of localManga) {
        try {
          const ratings = await api.getMangaRatings(manga.mal_id);
          // Filter out current user's rating
          const otherRatings = ratings.filter(r => r.username !== currentUser);
          if (otherRatings.length > 0) {
            ratingsMap[manga.mal_id] = otherRatings;
          }
        } catch (error) {
          console.error(`Error fetching ratings for manga ${manga.mal_id}:`, error);
        }
      }
      
      setOtherUsersRatings(ratingsMap);
    };
    
    if (localManga.length > 0) {
      fetchOtherUsersRatings();
    }
  }, [localManga]);

  const handleRatingChange = (malId, rating) => {
    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 0) {
      return; // Don't update if invalid
    }
    
    // Clamp to maximum of 11
    const clampedRating = Math.min(11, Math.max(0, numRating));
    
    // Round to nearest 0.5 for values 0-10, keep exact value for 10.5-11
    const roundedRating = clampedRating > 10 ? clampedRating : Math.round(clampedRating * 2) / 2;
    
    // Update local state immediately
    setLocalManga(prev => prev.map(m => 
      m.mal_id === malId ? { ...m, userRating: roundedRating } : m
    ));
    
    // Clear existing timeout for this manga
    if (saveTimeouts.current[malId]) {
      clearTimeout(saveTimeouts.current[malId]);
    }
    
    // Save after debounce delay
    saveTimeouts.current[malId] = setTimeout(async () => {
      await updateManga(malId, { userRating: roundedRating });
      onUpdate();
      delete saveTimeouts.current[malId];
    }, 500);
  };

  const handleChaptersChange = (malId, chapters) => {
    const chaptersInt = parseInt(chapters) || 0;
    const validChapters = Math.max(0, chaptersInt);
    
    // Update local state immediately
    setLocalManga(prev => prev.map(m => 
      m.mal_id === malId ? { ...m, chaptersRead: validChapters } : m
    ));
    
    // Clear existing timeout for this manga
    if (saveTimeouts.current[`${malId}-chapters`]) {
      clearTimeout(saveTimeouts.current[`${malId}-chapters`]);
    }
    
    // Save after debounce delay
    saveTimeouts.current[`${malId}-chapters`] = setTimeout(async () => {
      await updateManga(malId, { chaptersRead: validChapters });
      onUpdate();
      delete saveTimeouts.current[`${malId}-chapters`];
    }, 500);
  };

  const handleChaptersIncrement = (malId, increment) => {
    const manga = localManga.find(m => m.mal_id === malId);
    const currentChapters = manga?.chaptersRead || 0;
    const newChapters = Math.max(0, currentChapters + increment);
    
    // Update immediately
    handleChaptersChange(malId, newChapters.toString());
    
    // Highlight the input
    setTimeout(() => {
      const input = document.getElementById(`chapters-${malId}`);
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  };

  const handleStatusChange = async (malId, status) => {
    const manga = localManga.find(m => m.mal_id === malId);
    const updates = { status };
    
    // If status is "completed" and manga has total chapters, set chaptersRead to max
    if (status === 'completed' && manga && manga.chapters && manga.chapters > 0) {
      updates.chaptersRead = manga.chapters;
    }
    
    // Update local state immediately
    setLocalManga(prev => prev.map(m => 
      m.mal_id === malId ? { ...m, ...updates } : m
    ));
    
    // Save immediately for status changes (no debounce needed)
    await updateManga(malId, updates);
    onUpdate();
  };

  const handleCommentsChange = (malId, comments) => {
    // Update local state immediately
    setLocalManga(prev => prev.map(m => 
      m.mal_id === malId ? { ...m, comments } : m
    ));
    
    // Clear existing timeout for this manga
    if (saveTimeouts.current[`${malId}-comments`]) {
      clearTimeout(saveTimeouts.current[`${malId}-comments`]);
    }
    
    // Save after debounce delay
    saveTimeouts.current[`${malId}-comments`] = setTimeout(async () => {
      await updateManga(malId, { comments });
      onUpdate();
      delete saveTimeouts.current[`${malId}-comments`];
    }, 500);
  };

  const handleRemove = async (malId) => {
    if (window.confirm('Remove this manga from your list?')) {
      await removeManga(malId);
      onUpdate();
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  if (localManga.length === 0) {
    return (
      <div className="empty-state">
        <p>No manga found. Search and add some manga to get started, or try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="manga-list">
      {localManga.map((manga) => (
        <div key={manga.mal_id} id={`manga-${manga.mal_id}`} className="manga-card">
          <div className="manga-image">
            {manga.images?.jpg?.image_url ? (
              <img 
                src={manga.images.jpg.image_url} 
                alt={manga.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>
          
          <div className="manga-info">
            <div className="manga-title-section">
              <h3>{manga.title}</h3>
              <div className="manga-meta">
                {manga.published && manga.published.from && (
                  <span className="publish-date">
                    Started: {new Date(manga.published.from).getFullYear()}
                  </span>
                )}
                <span className="manga-status-badge">{manga.status || 'Unknown'}</span>
              </div>
            </div>
            {manga.title_japanese && (
              <p className="japanese-title">{manga.title_japanese}</p>
            )}
            {manga.synopsis && (
              <p className="synopsis">{manga.synopsis.substring(0, 150)}...</p>
            )}
            
            <div className="manga-stats">
              <div className="stat">
                <span className="stat-label">Chapters:</span>
                <span className="stat-value">
                  {manga.chapters 
                    ? `${manga.chaptersRead || 0} / ${manga.chapters}`
                    : `${manga.chaptersRead || 0}`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="manga-controls">
            <div className="control-group">
              <label htmlFor={`status-${manga.mal_id}`}>
                Status:
              </label>
              <select
                id={`status-${manga.mal_id}`}
                value={manga.status || 'reading'}
                onChange={(e) => handleStatusChange(manga.mal_id, e.target.value)}
                className="status-select"
              >
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="on hold">On Hold</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor={`rating-${manga.mal_id}`}>
                Your Rating:
              </label>
              <input
                id={`rating-${manga.mal_id}`}
                type="number"
                min="0"
                max="11"
                step="0.5"
                value={manga.userRating || 0}
                onChange={(e) => handleRatingChange(manga.mal_id, e.target.value)}
                className="rating-input"
                placeholder="Enter rating (0-10 or 10.5-11 for Peak)"
              />
              <div className="rating-display-value">
                {manga.userRating && manga.userRating > 10 ? (
                  <span className="rating-peak">PEAK</span>
                ) : (
                  <span className="rating-value">
                    {manga.userRating ? `${manga.userRating.toFixed(1)}/10` : '0.0/10'}
                  </span>
                )}
                {manga.userRating && manga.userRating > 10 && (
                  <span className="rating-numeric">({manga.userRating.toFixed(1)})</span>
                )}
              </div>
              
              {/* Other users' ratings */}
              {otherUsersRatings[manga.mal_id] && otherUsersRatings[manga.mal_id].length > 0 && (
                <div className="other-users-ratings">
                  <div className="other-ratings-label">Other Users:</div>
                  {otherUsersRatings[manga.mal_id].map((rating, index) => (
                    <div key={index} className="other-rating-item">
                      <span className="other-rating-username">{rating.username}:</span>
                      <span className="other-rating-value">
                        {rating.rating && rating.rating > 10 ? (
                          <>PEAK ({rating.rating.toFixed(1)})</>
                        ) : rating.rating ? `${rating.rating.toFixed(1)}/10` : 'No rating'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="control-group">
              <label htmlFor={`chapters-${manga.mal_id}`}>
                Chapters Read:
              </label>
              <div className="chapters-input-wrapper">
                <input
                  id={`chapters-${manga.mal_id}`}
                  type="number"
                  min="0"
                  max={manga.chapters || undefined}
                  step="1"
                  value={manga.chaptersRead || 0}
                  onChange={(e) => handleChaptersChange(manga.mal_id, e.target.value)}
                  className="chapters-input"
                />
                <button
                  type="button"
                  className="chapters-btn chapters-btn-minus"
                  onClick={() => handleChaptersIncrement(manga.mal_id, -1)}
                  aria-label="Decrease chapters"
                >
                  −
                </button>
                <button
                  type="button"
                  className="chapters-btn chapters-btn-plus"
                  onClick={() => handleChaptersIncrement(manga.mal_id, 1)}
                  aria-label="Increase chapters"
                >
                  +
                </button>
              </div>
              {manga.chapters && (
                <>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, ((manga.chaptersRead || 0) / manga.chapters) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {manga.chaptersRead || 0} / {manga.chapters} chapters
                  </span>
                </>
              )}
              {!manga.chapters && (
                <span className="progress-text">
                  {manga.chaptersRead || 0} chapters read
                </span>
              )}
            </div>

            <div className="control-group">
              <label htmlFor={`comments-${manga.mal_id}`}>
                Comments:
              </label>
              <textarea
                id={`comments-${manga.mal_id}`}
                value={manga.comments || ''}
                onChange={(e) => handleCommentsChange(manga.mal_id, e.target.value)}
                className="comments-input"
                placeholder="Add your thoughts..."
                rows="3"
              />
            </div>

            <button
              className="remove-btn"
              onClick={() => handleRemove(manga.mal_id)}
            >
              Remove from List
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MangaList;


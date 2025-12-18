import { useState, useEffect } from 'react';
import { getAllUsers } from '../services/userStorage';
import { getCurrentUser } from '../services/userStorage';
import { api } from '../services/api';
import './FriendsLists.css';

const FriendsLists = () => {
  const [allUsersManga, setAllUsersManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadAllUsersManga();
  }, []);

  const loadAllUsersManga = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      const allManga = [];

      for (const username of users) {
        if (username === currentUser) continue; // Skip current user
        
        try {
          const mangaList = await api.getUserMangaList(username);
          // Add username to each manga item
          mangaList.forEach(manga => {
            allManga.push({
              ...manga,
              ownerUsername: username
            });
          });
        } catch (error) {
          console.error(`Error loading manga for user ${username}:`, error);
        }
      }

      setAllUsersManga(allManga);
    } catch (error) {
      console.error('Error loading all users manga:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort by status priority: reading, completed, on hold, dropped
  const statusPriority = {
    'reading': 1,
    'completed': 2,
    'on hold': 3,
    'dropped': 4
  };

  const sortedAndFilteredManga = [...allUsersManga]
    .filter(manga => statusFilter === 'all' || manga.status === statusFilter)
    .sort((a, b) => {
      // First sort by status
      const statusA = statusPriority[a.status] || 99;
      const statusB = statusPriority[b.status] || 99;
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      // Then by rating (highest first)
      return (b.userRating || 0) - (a.userRating || 0);
    });

  if (loading) {
    return (
      <div className="friends-lists-loading">
        <p>Loading friends' lists...</p>
      </div>
    );
  }

  if (sortedAndFilteredManga.length === 0) {
    return (
      <div className="friends-lists-empty">
        <p>No manga found in friends' lists{statusFilter !== 'all' ? ` (${statusFilter})` : ''}.</p>
      </div>
    );
  }

  return (
    <div className="friends-lists">
      <div className="friends-lists-header">
        <h2>Friends' Lists</h2>
        <div className="status-filters">
          <button
            className={statusFilter === 'all' ? 'active' : ''}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={statusFilter === 'reading' ? 'active' : ''}
            onClick={() => setStatusFilter('reading')}
          >
            Reading
          </button>
          <button
            className={statusFilter === 'completed' ? 'active' : ''}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={statusFilter === 'on hold' ? 'active' : ''}
            onClick={() => setStatusFilter('on hold')}
          >
            On Hold
          </button>
          <button
            className={statusFilter === 'dropped' ? 'active' : ''}
            onClick={() => setStatusFilter('dropped')}
          >
            Dropped
          </button>
        </div>
      </div>

      <div className="manga-list">
        {sortedAndFilteredManga.map((manga, index) => (
          <div key={`${manga.mal_id}-${manga.ownerUsername}-${index}`} className="manga-card read-only">
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
                  <span className="owner-badge">{manga.ownerUsername}</span>
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

            <div className="manga-controls read-only-controls">
              <div className="control-group">
                <label>Rating:</label>
                <div className="rating-display-value">
                  {manga.userRating && manga.userRating > 10 ? (
                    <span className="rating-peak">PEAK</span>
                  ) : (
                    <span className="rating-value">
                      {manga.userRating ? `${manga.userRating.toFixed(1)}/10` : 'No rating'}
                    </span>
                  )}
                </div>
              </div>

              <div className="control-group">
                <label>Chapters Read:</label>
                <span className="chapters-display">
                  {manga.chapters 
                    ? `${manga.chaptersRead || 0} / ${manga.chapters}`
                    : `${manga.chaptersRead || 0}`
                  }
                </span>
                {manga.chapters && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, ((manga.chaptersRead || 0) / manga.chapters) * 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>

              {manga.comments && (
                <div className="control-group">
                  <label>Comments:</label>
                  <div className="comments-display">{manga.comments}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsLists;


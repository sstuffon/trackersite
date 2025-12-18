import { useState, useEffect } from 'react';
import { updateManga, removeManga } from '../services/storage';
import './MangaList.css';

const MangaList = ({ mangaList, onUpdate, scrollToId }) => {
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (scrollToId) {
      const element = document.getElementById(`manga-${scrollToId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToId]);

  const handleRatingChange = async (malId, rating) => {
    // Allow any number, including over 10 for "Peak"
    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 0) {
      return; // Don't update if invalid
    }
    // Round to nearest 0.5 for values 0-10, keep exact value for over 10
    const roundedRating = numRating > 10 ? numRating : Math.round(numRating * 2) / 2;
    await updateManga(malId, { userRating: roundedRating });
    onUpdate();
  };

  const handleChaptersChange = async (malId, chapters) => {
    await updateManga(malId, { chaptersRead: Math.max(0, parseInt(chapters) || 0) });
    onUpdate();
  };

  const handleStatusChange = async (malId, status) => {
    const manga = mangaList.find(m => m.mal_id === malId);
    const updates = { status };
    
    // If status is "completed" and manga has total chapters, set chaptersRead to max
    if (status === 'completed' && manga && manga.chapters && manga.chapters > 0) {
      updates.chaptersRead = manga.chapters;
    }
    
    await updateManga(malId, updates);
    onUpdate();
  };

  const handleCommentsChange = async (malId, comments) => {
    await updateManga(malId, { comments });
    onUpdate();
  };

  const handleRemove = async (malId) => {
    if (window.confirm('Remove this manga from your list?')) {
      await removeManga(malId);
      onUpdate();
    }
  };

  if (mangaList.length === 0) {
    return (
      <div className="empty-state">
        <p>No manga found. Search and add some manga to get started, or try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="manga-list">
      {mangaList.map((manga) => (
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
                step="0.5"
                value={manga.userRating || 0}
                onChange={(e) => handleRatingChange(manga.mal_id, e.target.value)}
                className="rating-input"
                placeholder="Enter rating (0-10 or over 10 for Peak)"
              />
              <div className="rating-display-value">
                {manga.userRating && manga.userRating > 10 ? (
                  <span className="rating-peak">PEAK</span>
                ) : (
                  <span className="rating-value">
                    {manga.userRating ? `${manga.userRating.toFixed(1)}/10` : '0.0/10'}
                  </span>
                )}
              </div>
            </div>

            <div className="control-group">
              <label htmlFor={`chapters-${manga.mal_id}`}>
                Chapters Read:
              </label>
              <input
                id={`chapters-${manga.mal_id}`}
                type="number"
                min="0"
                max={manga.chapters || undefined}
                value={manga.chaptersRead || 0}
                onChange={(e) => handleChaptersChange(manga.mal_id, e.target.value)}
                className="chapters-input"
              />
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


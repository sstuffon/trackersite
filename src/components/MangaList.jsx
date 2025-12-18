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

  const handleRatingChange = (malId, rating) => {
    const numRating = parseFloat(rating) || 0;
    const clampedRating = Math.max(0, Math.min(10, numRating));
    // Round to nearest 0.5
    const roundedRating = Math.round(clampedRating * 2) / 2;
    updateManga(malId, { userRating: roundedRating });
    onUpdate();
  };

  const handleChaptersChange = (malId, chapters) => {
    updateManga(malId, { chaptersRead: Math.max(0, parseInt(chapters) || 0) });
    onUpdate();
  };

  const handleStatusChange = (malId, status) => {
    updateManga(malId, { status });
    onUpdate();
  };

  const handleCommentsChange = (malId, comments) => {
    updateManga(malId, { comments });
    onUpdate();
  };

  const handleRemove = (malId) => {
    if (window.confirm('Remove this manga from your list?')) {
      removeManga(malId);
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
            <h3>{manga.title}</h3>
            {manga.title_japanese && (
              <p className="japanese-title">{manga.title_japanese}</p>
            )}
            {manga.synopsis && (
              <p className="synopsis">{manga.synopsis.substring(0, 150)}...</p>
            )}
            
            <div className="manga-stats">
              <div className="stat">
                <span className="stat-label">Total Chapters:</span>
                <span className="stat-value">{manga.chapters || 'Unknown'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Status:</span>
                <span className="stat-value">{manga.status || 'Unknown'}</span>
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
                Your Rating (0-10, .5 increments):
              </label>
              <input
                id={`rating-${manga.mal_id}`}
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={manga.userRating || 0}
                onChange={(e) => handleRatingChange(manga.mal_id, e.target.value)}
                className="rating-input"
              />
              <div className="rating-display">
                {Array.from({ length: 10 }, (_, i) => {
                  const rating = manga.userRating || 0;
                  const starValue = i + 1;
                  const isFilled = starValue <= rating;
                  const isHalf = starValue - 0.5 <= rating && rating < starValue;
                  return (
                    <span
                      key={i}
                      className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''}`}
                      title={`${rating.toFixed(1)}/10`}
                    >
                      {isHalf ? '☆' : '★'}
                    </span>
                  );
                })}
              </div>
              <span className="rating-value">{(manga.userRating || 0).toFixed(1)}/10</span>
            </div>

            <div className="control-group">
              <label htmlFor={`chapters-${manga.mal_id}`}>
                Chapters Read:
              </label>
              <input
                id={`chapters-${manga.mal_id}`}
                type="number"
                min="0"
                value={manga.chaptersRead || 0}
                onChange={(e) => handleChaptersChange(manga.mal_id, e.target.value)}
                className="chapters-input"
              />
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
              <span className="progress-text">
                {manga.chapters 
                  ? `${manga.chaptersRead || 0} / ${manga.chapters}`
                  : `${manga.chaptersRead || 0} chapters`
                }
              </span>
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


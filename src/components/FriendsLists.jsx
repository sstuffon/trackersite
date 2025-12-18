import { useState, useEffect } from 'react';
import { getAllUsers } from '../services/userStorage';
import { getCurrentUser } from '../services/userStorage';
import { api } from '../services/api';
import './FriendsLists.css';

const FriendsLists = () => {
  const [view, setView] = useState('users'); // 'users', 'userList', 'all'
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsersManga, setAllUsersManga] = useState([]);
  const [userManga, setUserManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('status'); // 'status', 'lowest', 'highest'
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (view === 'all') {
      loadAllUsersManga();
    }
  }, [view]);

  const loadAllUsersManga = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      const allManga = [];
      const mangaMap = {}; // Track manga by mal_id for averaging

      for (const username of users) {
        if (username === currentUser) continue; // Skip current user
        
        try {
          const mangaList = await api.getUserMangaList(username);
          // Add username to each manga item
          mangaList.forEach(manga => {
            const mangaWithOwner = {
              ...manga,
              ownerUsername: username
            };
            allManga.push(mangaWithOwner);
            
            // Track for average rating calculation
            if (!mangaMap[manga.mal_id]) {
              mangaMap[manga.mal_id] = {
                manga: manga,
                ratings: [],
                owners: []
              };
            }
            if (manga.userRating !== undefined && manga.userRating !== null) {
              mangaMap[manga.mal_id].ratings.push(manga.userRating);
              mangaMap[manga.mal_id].owners.push(username);
            }
          });
        } catch (error) {
          console.error(`Error loading manga for user ${username}:`, error);
        }
      }

      // Calculate average ratings
      const mangaWithAverages = allManga.map(manga => {
        const avgData = mangaMap[manga.mal_id];
        const avgRating = avgData && avgData.ratings.length > 0
          ? avgData.ratings.reduce((sum, r) => sum + r, 0) / avgData.ratings.length
          : null;
        
        return {
          ...manga,
          averageRating: avgRating,
          ratingCount: avgData ? avgData.ratings.length : 0
        };
      });

      setAllUsersManga(mangaWithAverages);
    } catch (error) {
      console.error('Error loading all users manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserManga = async (username) => {
    try {
      setLoading(true);
      const mangaList = await api.getUserMangaList(username);
      setUserManga(mangaList);
      setSelectedUser(username);
      setView('userList');
    } catch (error) {
      console.error(`Error loading manga for user ${username}:`, error);
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

  const getSortedAndFilteredManga = (mangaList) => {
    let filtered = [...mangaList].filter(manga => statusFilter === 'all' || manga.status === statusFilter);
    
    if (sortBy === 'status') {
      return filtered.sort((a, b) => {
        const statusA = statusPriority[a.status] || 99;
        const statusB = statusPriority[b.status] || 99;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        return (b.userRating || 0) - (a.userRating || 0);
      });
    } else if (sortBy === 'lowest') {
      return filtered.sort((a, b) => {
        const ratingA = view === 'all' ? (a.averageRating || 0) : (a.userRating || 0);
        const ratingB = view === 'all' ? (b.averageRating || 0) : (b.userRating || 0);
        return ratingA - ratingB;
      });
    } else if (sortBy === 'highest') {
      return filtered.sort((a, b) => {
        const ratingA = view === 'all' ? (a.averageRating || 0) : (a.userRating || 0);
        const ratingB = view === 'all' ? (b.averageRating || 0) : (b.userRating || 0);
        return ratingB - ratingA;
      });
    }
    
    return filtered;
  };

  const sortedAndFilteredManga = getSortedAndFilteredManga(
    view === 'all' ? allUsersManga : userManga
  );

  // Show user list first
  if (view === 'users') {
    return <FriendsUserList onSelectUser={loadUserManga} onViewAll={() => setView('all')} />;
  }

  if (loading) {
    return (
      <div className="friends-lists-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="friends-lists">
      <div className="friends-lists-header">
        <div className="header-top">
          <button className="back-button" onClick={() => setView('users')}>
            ← Back to Users
          </button>
          <h2>
            {view === 'all' ? "All Friends' Manga" : `${selectedUser}'s List`}
          </h2>
        </div>
        <div className="filters-and-sort">
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
          <div className="sort-options">
            <span className="sort-label">Sort:</span>
            <button
              className={sortBy === 'status' ? 'active' : ''}
              onClick={() => setSortBy('status')}
            >
              Status
            </button>
            <button
              className={sortBy === 'lowest' ? 'active' : ''}
              onClick={() => setSortBy('lowest')}
            >
              Lowest Score
            </button>
            <button
              className={sortBy === 'highest' ? 'active' : ''}
              onClick={() => setSortBy('highest')}
            >
              {view === 'all' ? 'Highest Avg' : 'Highest Score'}
            </button>
          </div>
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
                  {view === 'all' && manga.ownerCount > 0 && (
                    <span className="owner-badge">
                      {manga.ownerCount} {manga.ownerCount === 1 ? 'user' : 'users'}
                    </span>
                  )}
                  {view === 'all' && manga.averageRating !== null && (
                    <span className="avg-rating-badge">
                      Avg: {manga.averageRating.toFixed(1)}/10 ({manga.ratingCount} {manga.ratingCount === 1 ? 'rating' : 'ratings'})
                    </span>
                  )}
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
      {sortedAndFilteredManga.length === 0 && (
        <div className="friends-lists-empty">
          <p>No manga found{statusFilter !== 'all' ? ` (${statusFilter})` : ''}.</p>
        </div>
      )}
    </div>
  );
};

const FriendsUserList = ({ onSelectUser, onViewAll }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      const otherUsers = allUsers.filter(u => u !== currentUser);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="friends-lists-loading">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="friends-user-list">
      <h2>Friends' Lists</h2>
      <div className="users-grid">
        <div className="user-card view-all-card" onClick={onViewAll}>
          <div className="user-card-content">
            <span className="user-card-name">View All</span>
            <span className="user-card-description">See all manga from all friends</span>
          </div>
        </div>
        {users.map(username => (
          <div key={username} className="user-card" onClick={() => onSelectUser(username)}>
            <div className="user-card-content">
              <span className="user-card-name">{username}</span>
              <span className="user-card-description">View {username}'s list</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsLists;


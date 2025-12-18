import { useState, useEffect } from 'react';
import MangaList from './components/MangaList';
import SearchManga from './components/SearchManga';
import UsersLists from './components/UsersLists';
import FriendsLists from './components/FriendsLists';
import ViewSpecific from './components/ViewSpecific';
import FloatingLegend from './components/Sidebar';
import { getTrackedManga } from './services/storage';
import { getCurrentUser } from './services/userStorage';
import './App.css';

function App() {
  const [trackedManga, setTrackedManga] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState(null); // null, 'highest', 'lowest'
  const [scrollToId, setScrollToId] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    loadManga();
  }, [currentUser]);

  const loadManga = async () => {
    try {
      const manga = await getTrackedManga();
      setTrackedManga(Array.isArray(manga) ? manga : []);
      setCurrentUser(getCurrentUser());
    } catch (error) {
      console.error('Error loading manga:', error);
      setTrackedManga([]);
    }
  };

  const handleMangaUpdate = () => {
    loadManga();
  };

  const handleUserSwitch = () => {
    loadManga();
    setActiveTab('list');
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleSortOrder = (order) => {
    setSortOrder(order === sortOrder ? null : order); // Toggle off if clicking same button
  };

  const handleNavigateToManga = (malId) => {
    setScrollToId(malId);
    setTimeout(() => {
      const element = document.getElementById(`manga-${malId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.borderLeftColor = 'var(--text-primary)';
        setTimeout(() => {
          element.style.borderLeftColor = '';
        }, 2000);
      }
    }, 100);
  };

  // Filter by status first, then sort if sort order is set
  let filteredManga = trackedManga.filter(manga => statusFilter === 'all' || manga.status === statusFilter);
  
  // Apply sorting if sort order is selected
  if (sortOrder === 'highest') {
    filteredManga = [...filteredManga].sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
  } else if (sortOrder === 'lowest') {
    filteredManga = [...filteredManga].sort((a, b) => (a.userRating || 0) - (b.userRating || 0));
  }
  
  const sortedAndFilteredManga = filteredManga;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Reading Tracker by Stephan</h1>
        <p>for friends</p>
        <div className="current-user-indicator">
          Current User: <span className="user-name">{currentUser}</span>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          My List
        </button>
        <button 
          className={activeTab === 'search' ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          Search & Add
        </button>
        <button 
          className={activeTab === 'viewSpecific' ? 'active' : ''}
          onClick={() => setActiveTab('viewSpecific')}
        >
          View Specific
        </button>
        <button 
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          Friend's List
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users Lists
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'list' ? (
          <>
            <div className="sort-controls">
              <span className="sort-label">Sort by:</span>
              <button
                className={`sort-btn ${sortOrder === 'highest' ? 'active' : ''}`}
                onClick={() => handleSortOrder('highest')}
              >
                Highest Score
              </button>
              <button
                className={`sort-btn ${sortOrder === 'lowest' ? 'active' : ''}`}
                onClick={() => handleSortOrder('lowest')}
              >
                Lowest Score
              </button>
            </div>
            <MangaList 
              mangaList={sortedAndFilteredManga} 
              onUpdate={handleMangaUpdate}
              scrollToId={scrollToId}
            />
          </>
        ) : activeTab === 'search' ? (
          <SearchManga onAdd={handleMangaUpdate} />
        ) : activeTab === 'viewSpecific' ? (
          <ViewSpecific />
        ) : activeTab === 'friends' ? (
          <FriendsLists />
        ) : (
          <UsersLists onUserSwitch={handleUserSwitch} />
        )}
      </main>

      {activeTab !== 'users' && activeTab !== 'friends' && activeTab !== 'viewSpecific' && (
        <FloatingLegend
          mangaList={trackedManga}
          onStatusFilter={handleStatusFilter}
          onNavigateToManga={handleNavigateToManga}
          currentFilter={statusFilter}
        />
      )}
    </div>
  );
}

export default App;


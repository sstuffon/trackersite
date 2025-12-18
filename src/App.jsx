import { useState, useEffect } from 'react';
import MangaList from './components/MangaList';
import SearchManga from './components/SearchManga';
import UsersLists from './components/UsersLists';
import FriendsLists from './components/FriendsLists';
import FloatingLegend from './components/Sidebar';
import { getTrackedManga } from './services/storage';
import { getCurrentUser } from './services/userStorage';
import './App.css';

function App() {
  const [trackedManga, setTrackedManga] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // Sort by rating (highest first), then filter by status
  const sortedAndFilteredManga = [...trackedManga]
    .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
    .filter(manga => statusFilter === 'all' || manga.status === statusFilter);

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
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          Friends' Lists
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
          <MangaList 
            mangaList={sortedAndFilteredManga} 
            onUpdate={handleMangaUpdate}
            scrollToId={scrollToId}
          />
        ) : activeTab === 'search' ? (
          <SearchManga onAdd={handleMangaUpdate} />
        ) : activeTab === 'friends' ? (
          <FriendsLists />
        ) : (
          <UsersLists onUserSwitch={handleUserSwitch} />
        )}
      </main>

      {activeTab !== 'users' && activeTab !== 'friends' && (
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


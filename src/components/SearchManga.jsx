import { useState, useEffect, useRef } from 'react';
import { searchManga } from '../services/jikanApi';
import { addManga } from '../services/storage';
import './SearchManga.css';

const SearchManga = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchTimeoutRef = useRef(null);
  const autocompleteTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (autocompleteTimeoutRef.current) clearTimeout(autocompleteTimeoutRef.current);
    };
  }, []);

  const handleAutocomplete = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    autocompleteTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchManga(searchQuery);
        setAutocompleteResults(data.slice(0, 5)); // Limit to 5 for autocomplete
        setShowAutocomplete(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
        setAutocompleteResults([]);
      }
    }, 500); // Debounce 500ms
  };

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    handleAutocomplete(newQuery);
  };

  const handleSelectAutocomplete = (manga) => {
    setQuery(manga.title);
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    handleAdd(manga);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setShowAutocomplete(false);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchManga(query);
        setResults(data);
        if (data.length === 0) {
          setMessage('No results found. Try a different search term.');
        } else {
          setMessage('');
        }
      } catch (err) {
        setError('Failed to search. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleAdd = async (manga) => {
    try {
      const success = await addManga(manga);
      if (success) {
        setMessage(`"${manga.title}" added to your list!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`"${manga.title}" is already in your list.`);
        setTimeout(() => setMessage(''), 3000);
      }
      onAdd();
    } catch (error) {
      setMessage('Error adding manga. Please try again.');
      setTimeout(() => setMessage(''), 3000);
      console.error('Error adding manga:', error);
    }
  };

  return (
    <div className="search-manga">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query.length >= 2 && setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            placeholder="Search for manga or manhwa..."
            className="search-input"
          />
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div className="autocomplete-dropdown">
              {autocompleteResults.map((manga) => (
                <button
                  key={manga.mal_id}
                  type="button"
                  className="autocomplete-item"
                  onClick={() => handleSelectAutocomplete(manga)}
                >
                  <div className="autocomplete-image">
                    {manga.images?.jpg?.image_url ? (
                      <img 
                        src={manga.images.jpg.image_url} 
                        alt={manga.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="autocomplete-no-image">No Image</div>
                    )}
                  </div>
                  <div className="autocomplete-text">
                    <span className="autocomplete-title">{manga.title}</span>
                    {manga.title_japanese && (
                      <span className="autocomplete-japanese">{manga.title_japanese}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className="search-btn">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('already') ? 'warning' : 'success'}`}>
          {message}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="search-results">
          <h2>Search Results</h2>
          <div className="results-grid">
            {results.map((manga) => (
              <div key={manga.mal_id} className="result-card">
                <div className="result-image">
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
                <div className="result-info">
                  <h3>{manga.title}</h3>
                  {manga.title_japanese && (
                    <p className="japanese-title">{manga.title_japanese}</p>
                  )}
                  {manga.synopsis && (
                    <p className="synopsis">{manga.synopsis.substring(0, 100)}...</p>
                  )}
                  <div className="result-stats">
                    <span>Chapters: {manga.chapters || 'Unknown'}</span>
                    {manga.score && <span>Score: {manga.score}/10</span>}
                  </div>
                  <button
                    className="add-btn"
                    onClick={() => handleAdd(manga)}
                  >
                    Add to List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchManga;


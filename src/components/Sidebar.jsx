import { useState } from 'react';
import './Sidebar.css';

const STATUSES = ['all', 'reading', 'completed', 'dropped', 'on hold'];

const FloatingLegend = ({ mangaList, onStatusFilter, onNavigateToManga, currentFilter }) => {
  const [expanded, setExpanded] = useState(false);

  const getMangaByStatus = (status) => {
    if (status === 'all') return mangaList;
    return mangaList.filter(m => m.status === status);
  };

  const getStatusCount = (status) => {
    return getMangaByStatus(status).length;
  };

  return (
    <div className={`floating-legend ${expanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="legend-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▼' : '▲'} LEGEND
      </button>
      
      {expanded && (
        <div className="legend-content">
          <div className="status-filters">
            {STATUSES.map(status => (
              <div key={status} className="status-group">
                <button
                  className={`status-filter-btn ${currentFilter === status ? 'active' : ''}`}
                  onClick={() => onStatusFilter(status)}
                >
                  <span className="status-name">{status.toUpperCase()}</span>
                  <span className="status-count">({getStatusCount(status)})</span>
                </button>
                
                {status !== 'all' && getStatusCount(status) > 0 && (
                  <div className="status-manga-list">
                    {getMangaByStatus(status).map(manga => (
                        <button
                          key={manga.mal_id}
                          className="manga-link"
                          onClick={() => onNavigateToManga(manga.mal_id)}
                        >
                          {manga.title.length > 25 
                            ? manga.title.substring(0, 25) + '...' 
                            : manga.title}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingLegend;


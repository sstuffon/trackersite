import { useState, useEffect } from 'react';
import { getAllUsers, getUserStats, setCurrentUser, getCurrentUser, addUser } from '../services/userStorage';
import './UsersLists.css';

const UsersLists = ({ onUserSwitch }) => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    if (allUsers.length === 0) {
      // Initialize with default user if no users exist
      addUser('default');
      setCurrentUser('default');
      setCurrentUserState('default');
    }
    setUsers(getAllUsers());
    setCurrentUserState(getCurrentUser());
  };

  const handleCreateUser = () => {
    if (!newUsername.trim()) return;
    const username = newUsername.trim().toLowerCase();
    
    if (users.includes(username)) {
      alert('Username already exists!');
      return;
    }
    
    if (addUser(username)) {
      setNewUsername('');
      loadUsers();
    }
  };

  const handleSwitchUser = (username) => {
    setCurrentUser(username);
    setCurrentUserState(username);
    if (onUserSwitch) {
      onUserSwitch();
    }
  };

  return (
    <div className="users-lists">
      <div className="current-user-section">
        <h2>CURRENT USER</h2>
        <div className="current-user-display">
          <span className="username">{currentUser}</span>
          <span className="user-badge">ACTIVE</span>
        </div>
      </div>

      <div className="create-user-section">
        <h2>CREATE NEW USER</h2>
        <div className="create-user-form">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
            placeholder="Enter username..."
            className="username-input"
          />
          <button onClick={handleCreateUser} className="create-btn">
            CREATE
          </button>
        </div>
      </div>

      <div className="all-users-section">
        <h2>ALL USERS ({users.length})</h2>
        <div className="users-grid">
          {users.map(username => {
            const stats = getUserStats(username);
            const isCurrent = username === currentUser;
            
            return (
              <div 
                key={username} 
                className={`user-card ${isCurrent ? 'active' : ''}`}
              >
                <div className="user-card-header">
                  <span className="user-card-name">{username}</span>
                  {isCurrent && <span className="current-badge">CURRENT</span>}
                </div>
                
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{stats.total}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Reading:</span>
                    <span className="stat-value">{stats.reading}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value">{stats.completed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Dropped:</span>
                    <span className="stat-value">{stats.dropped}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">On Hold:</span>
                    <span className="stat-value">{stats.onHold}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Rating:</span>
                    <span className="stat-value">{stats.avgRating}</span>
                  </div>
                </div>
                
                <button
                  className={`switch-btn ${isCurrent ? 'disabled' : ''}`}
                  onClick={() => !isCurrent && handleSwitchUser(username)}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'CURRENT' : 'SWITCH TO THIS USER'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersLists;


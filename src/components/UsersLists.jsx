import { useState, useEffect } from 'react';
import { getAllUsers, getUserStats, setCurrentUser, getCurrentUser, addUser } from '../services/userStorage';
import './UsersLists.css';

const UserCard = ({ username, currentUser, onSwitch }) => {
  const [stats, setStats] = useState({
    total: 0,
    reading: 0,
    completed: 0,
    dropped: 0,
    onHold: 0,
    avgRating: '0.0'
  });
  const isCurrent = username === currentUser;

  useEffect(() => {
    getUserStats(username).then(setStats).catch(console.error);
  }, [username]);

  return (
    <div className={`user-card ${isCurrent ? 'active' : ''}`}>
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
        onClick={() => !isCurrent && onSwitch(username)}
        disabled={isCurrent}
      >
        {isCurrent ? 'CURRENT' : 'SWITCH TO THIS USER'}
      </button>
    </div>
  );
};

const UsersLists = ({ onUserSwitch }) => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      if (allUsers.length === 0) {
        // Initialize with default user if no users exist
        try {
          await addUser('default');
          setCurrentUser('default');
          setCurrentUserState('default');
        } catch (error) {
          console.error('Error creating default user:', error);
        }
      }
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      setCurrentUserState(getCurrentUser());
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(['default']);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;
    const username = newUsername.trim().toLowerCase();
    
    if (users.includes(username)) {
      alert('Username already exists!');
      return;
    }
    
    try {
      const success = await addUser(username);
      if (success) {
        setNewUsername('');
        await loadUsers();
      } else {
        alert('Username already exists!');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // If it's a network error, the fallback should have handled it
      // But if it's another error, show a message
      if (!error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
        alert('Error creating user. Please try again.');
      } else {
        // Fallback worked, reload users
        setNewUsername('');
        await loadUsers();
      }
    }
  };

  const handleSwitchUser = (username) => {
    setCurrentUser(username);
    setCurrentUserState(username);
    // Force reload after a short delay to ensure state updates
    setTimeout(() => {
      if (onUserSwitch) {
        onUserSwitch();
      }
    }, 100);
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
          {users.map(username => (
            <UserCard
              key={username}
              username={username}
              currentUser={currentUser}
              onSwitch={handleSwitchUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersLists;


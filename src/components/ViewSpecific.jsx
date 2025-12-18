import { useState, useEffect } from 'react';
import { getAllUsers } from '../services/userStorage';
import { getCurrentUser } from '../services/userStorage';
import { api } from '../services/api';
import './ViewSpecific.css';

const ViewSpecific = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsersWithLists();
  }, []);

  const loadUsersWithLists = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      const usersWithLists = [];

      // Check each user to see if they have manga in their list
      for (const username of allUsers) {
        try {
          const mangaList = await api.getUserMangaList(username);
          if (mangaList && mangaList.length > 0) {
            usersWithLists.push({
              username,
              mangaCount: mangaList.length
            });
          }
        } catch (error) {
          console.error(`Error checking manga for user ${username}:`, error);
        }
      }

      setUsers(usersWithLists);
    } catch (error) {
      console.error('Error loading users with lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (username) => {
    // Switch to Friends Lists tab and load that user's list
    window.location.hash = `#friends-${username}`;
    // Trigger a custom event that App.jsx can listen to
    window.dispatchEvent(new CustomEvent('viewSpecificUser', { detail: { username } }));
  };

  if (loading) {
    return (
      <div className="view-specific-loading">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="view-specific">
      <h2>View Specific User</h2>
      <p className="view-specific-description">Select a user to view their manga list</p>
      <div className="users-grid">
        {users.map(user => (
          <div key={user.username} className="user-card" onClick={() => handleViewUser(user.username)}>
            <div className="user-card-content">
              <span className="user-card-name">{user.username}</span>
              <span className="user-card-count">{user.mangaCount} {user.mangaCount === 1 ? 'manga' : 'manga'}</span>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="no-users-message">
            <p>No users with manga lists found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSpecific;


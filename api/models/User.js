// User model - stores user information
// This is a simple schema since we're using MongoDB

module.exports = {
  username: String,
  createdAt: { type: Date, default: Date.now }
};


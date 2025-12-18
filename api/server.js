const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// CORS configuration - allow all origins for now
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Initialize data files
async function initializeData() {
  await ensureDataDir();
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([]));
  }
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({}));
  }
}

// Read users
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write users
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Read all data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write all data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const users = await readUsers();
    const normalizedUsername = username.trim().toLowerCase();

    if (users.includes(normalizedUsername)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    users.push(normalizedUsername);
    await writeUsers(users);

    // Initialize empty list for new user
    const data = await readData();
    data[normalizedUsername] = [];
    await writeData(data);

    res.json({ success: true, username: normalizedUsername });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's manga list
app.get('/api/users/:username/manga', async (req, res) => {
  try {
    const { username } = req.params;
    const data = await readData();
    res.json(data[username] || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save user's manga list
app.post('/api/users/:username/manga', async (req, res) => {
  try {
    const { username } = req.params;
    const mangaList = req.body;

    const data = await readData();
    data[username] = mangaList;
    await writeData(data);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
app.get('/api/users/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;
    const data = await readData();
    const list = data[username] || [];

    const stats = {
      total: list.length,
      reading: list.filter(m => m.status === 'reading').length,
      completed: list.filter(m => m.status === 'completed').length,
      dropped: list.filter(m => m.status === 'dropped').length,
      onHold: list.filter(m => m.status === 'on hold').length,
      avgRating: list.length > 0
        ? (list.reduce((sum, m) => sum + (m.userRating || 0), 0) / list.length).toFixed(1)
        : '0.0'
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize and start server
const PORT = process.env.PORT || 3001;

initializeData().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
});

module.exports = app;


const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

// CORS configuration - allow all origins for now
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker';
const DB_NAME = 'tracker';
const USERS_COLLECTION = 'users';
const MANGA_COLLECTION = 'mangaLists';

let client;
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    if (!client || !client.topology || !client.topology.isConnected()) {
      if (client) {
        try {
          await client.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      console.log('Connected to MongoDB');
    }
    if (!db) {
      db = client.db(DB_NAME);
    }
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Initialize database connection (only for non-serverless environments)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().catch(console.error);
}

// Helper functions for database operations
async function getUsersCollection() {
  const database = await connectDB();
  if (!database) {
    throw new Error('Database connection not available');
  }
  return database.collection(USERS_COLLECTION);
}

async function getMangaCollection() {
  const database = await connectDB();
  if (!database) {
    throw new Error('Database connection not available');
  }
  return database.collection(MANGA_COLLECTION);
}

// Read users from database
async function readUsers() {
  try {
    const collection = await getUsersCollection();
    const users = await collection.find({}).toArray();
    return users.map(u => u.username).sort();
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Read user's manga list from database
async function readUserMangaList(username) {
  try {
    const collection = await getMangaCollection();
    const doc = await collection.findOne({ username });
    return doc ? doc.manga : [];
  } catch (error) {
    console.error('Error reading manga list:', error);
    return [];
  }
}

// Save user's manga list to database
async function saveUserMangaList(username, mangaList) {
  try {
    const collection = await getMangaCollection();
    await collection.updateOne(
      { username },
      { 
        $set: { 
          username, 
          manga: mangaList, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving manga list:', error);
    return false;
  }
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

    const normalizedUsername = username.trim().toLowerCase();
    const users = await readUsers();

    if (users.includes(normalizedUsername)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Add user to database
    const usersCollection = await getUsersCollection();
    await usersCollection.insertOne({
      username: normalizedUsername,
      createdAt: new Date()
    });

    // Initialize empty manga list for new user
    await saveUserMangaList(normalizedUsername, []);

    res.json({ success: true, username: normalizedUsername });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's manga list
app.get('/api/users/:username/manga', async (req, res) => {
  try {
    const { username } = req.params;
    const mangaList = await readUserMangaList(username);
    res.json(mangaList);
  } catch (error) {
    console.error('Error fetching manga list:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save user's manga list
app.post('/api/users/:username/manga', async (req, res) => {
  try {
    const { username } = req.params;
    const mangaList = req.body;

    const success = await saveUserMangaList(username, mangaList);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save manga list' });
    }
  } catch (error) {
    console.error('Error saving manga list:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
app.get('/api/users/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;
    const list = await readUserMangaList(username);

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
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Reading Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      userManga: '/api/users/:username/manga',
      userStats: '/api/users/:username/stats'
    }
  });
});

// Initialize and start server
const PORT = process.env.PORT || 3001;

// For Vercel/serverless, we don't need to listen
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(console.error);
}

module.exports = app;


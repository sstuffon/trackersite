# Backend API for Reading Tracker

This is the backend API server for the Reading Tracker application. It stores user data and manga lists on the server instead of in browser localStorage.

## Deployment

### Option 1: Vercel (Recommended - Free)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from the `api` directory:
```bash
cd api
vercel
```

3. Follow the prompts and deploy

4. Update the API URL in `src/services/api.js` with your Vercel deployment URL

### Option 2: Railway (Free tier available)

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Set the root directory to `api`
5. Deploy

### Option 3: Render (Free tier available)

1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `api`
5. Build command: `cd api && npm install`
6. Start command: `cd api && npm start`

## Local Development

1. Install dependencies:
```bash
cd api
npm install
```

2. Run the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:username/manga` - Get user's manga list
- `POST /api/users/:username/manga` - Save user's manga list
- `GET /api/users/:username/stats` - Get user statistics
- `GET /api/health` - Health check

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)

## Data Storage

Currently uses JSON files in the `api/data/` directory. For production, consider upgrading to:
- MongoDB
- PostgreSQL
- Supabase
- Firebase


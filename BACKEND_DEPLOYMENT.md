# Backend Deployment Guide

The backend API needs to be deployed separately from the frontend. Here are the steps:

## Quick Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Deploy the API**:
```bash
cd api
vercel
```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name (e.g., `tracker-api`)
   - Deploy

4. **Get your deployment URL** (e.g., `https://tracker-api.vercel.app`)

5. **Update the frontend API URL**:
   - Edit `src/services/api.js`
   - Update `API_BASE_URL` with your Vercel URL
   - Or set environment variable `VITE_API_URL` when building

6. **Rebuild and redeploy frontend**:
   - Push changes to GitHub
   - GitHub Actions will automatically rebuild

## Alternative: Railway or Render

See `api/README.md` for instructions on deploying to Railway or Render.

## Important Notes

- The backend stores data in JSON files (in `api/data/` directory)
- For production, consider upgrading to a database (MongoDB, PostgreSQL, etc.)
- The API URL must be accessible from the frontend (CORS enabled)
- Update `src/services/api.js` with your backend URL before deploying frontend

## Testing Locally

1. Start the backend:
```bash
cd api
npm install
npm start
```

2. Update `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

3. Start the frontend:
```bash
npm run dev
```


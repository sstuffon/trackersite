# Database Setup for Reading Tracker

Your backend now uses **MongoDB Atlas** (free cloud database) to store users and manga lists persistently across all devices.

## Required Dependencies

The backend now requires:
- **mongodb** (^6.3.0) - MongoDB driver for Node.js

This is already added to `api/package.json`.

## Quick Setup

1. **Create MongoDB Atlas Account** (free)
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up and verify email

2. **Create Free Cluster**
   - Choose M0 FREE tier
   - Select region closest to you
   - Wait 1-3 minutes for cluster creation

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your database user
   - Add `/tracker` at the end for database name

4. **Deploy Backend to Vercel**
   ```bash
   cd api
   npm install
   vercel
   ```

5. **Add Environment Variable in Vercel**
   - Go to Vercel project → Settings → Environment Variables
   - Add: `MONGODB_URI` = your connection string
   - Redeploy

6. **Update Frontend API URL**
   - Edit `src/services/api.js`
   - Update `API_BASE_URL` with your Vercel deployment URL

## Detailed Instructions

See `api/MONGODB_SETUP.md` for step-by-step instructions with screenshots guidance.

## Benefits

✅ **Persistent Storage** - Data survives server restarts  
✅ **Cross-Device Sync** - Users and lists available on all devices  
✅ **Free Tier** - 512MB storage, perfect for this app  
✅ **Scalable** - Easy to upgrade if needed  
✅ **Secure** - Encrypted connections, environment variables  

## What Changed

- Backend now uses MongoDB instead of JSON files
- Data persists across deployments
- Users created on one device appear on all devices
- Manga lists sync across all devices


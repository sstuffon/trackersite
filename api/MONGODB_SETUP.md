# MongoDB Setup Guide

This guide will help you set up MongoDB Atlas (free cloud database) for your Reading Tracker backend.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (Free forever)
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to you
5. Click **"Create"** (takes 1-3 minutes)

## Step 3: Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username and password (save these!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for serverless functions)
   - Or add specific IPs if you prefer
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Database"** (Clusters)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tracker?retryWrites=true&w=majority`

## Step 6: Set Environment Variable

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add a new variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your connection string from Step 5
4. Click **"Save"**
5. Redeploy your application

### For Local Development:

Create a `.env` file in the `api` directory:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tracker?retryWrites=true&w=majority
```

**Important**: Add `.env` to `.gitignore` to keep your password secret!

## Step 7: Deploy Backend

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to `api` directory: `cd api`
3. Deploy: `vercel`
4. Follow prompts and deploy
5. Add the `MONGODB_URI` environment variable in Vercel dashboard
6. Redeploy if needed

## Step 8: Update Frontend API URL

1. Get your Vercel deployment URL (e.g., `https://tracker-api.vercel.app`)
2. Update `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'https://your-api-url.vercel.app';
   ```
3. Commit and push to GitHub

## Troubleshooting

### Connection Issues
- Make sure Network Access allows your IP or "Anywhere"
- Verify username and password in connection string
- Check that database name is included in connection string

### Authentication Errors
- Ensure database user has proper permissions
- Verify password doesn't contain special characters that need URL encoding

### Deployment Issues
- Make sure `MONGODB_URI` environment variable is set in Vercel
- Check Vercel function logs for error messages

## Security Notes

- Never commit your MongoDB connection string to GitHub
- Use environment variables for all sensitive data
- The free tier is perfect for development and small applications
- MongoDB Atlas free tier includes 512MB storage (plenty for this app)


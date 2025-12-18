# Deployment Guide - GitHub Pages

This guide will help you deploy your Reading Tracker to GitHub Pages so you and your friends can access it from anywhere.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Your project code ready

## Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right, then select "New repository"
3. Name your repository (e.g., `reading-tracker` or `manga-tracker`)
4. Choose **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Initialize Git and Push Your Code

Open your terminal in the project directory and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Reading Tracker"

# Add your GitHub repository as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The deployment workflow will run automatically

### 4. Update Base Path (If Needed)

If your repository name is NOT `YOUR_USERNAME.github.io`, you need to update the base path:

1. Open `vite.config.js`
2. Update the base path to match your repository name:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/',
})
```

For example, if your repo is `reading-tracker`, use:
```javascript
base: '/reading-tracker/',
```

If your repository IS `YOUR_USERNAME.github.io`, keep the base as `/` (default).

### 5. Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Once it's done, go back to **Settings > Pages**
5. Your site URL will be displayed there

### 6. Access Your Site

Your site will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` (if using a custom repo name)
- `https://YOUR_USERNAME.github.io/` (if repo is `YOUR_USERNAME.github.io`)

## Updating Your Site

Every time you push changes to the `main` branch, GitHub Actions will automatically rebuild and deploy your site. Just:

```bash
git add .
git commit -m "Your update message"
git push
```

Wait a few minutes for the deployment to complete, and your changes will be live!

## Troubleshooting

### Site shows 404
- Make sure GitHub Pages is enabled in Settings > Pages
- Check that the workflow completed successfully in the Actions tab
- Verify the base path in `vite.config.js` matches your repository name

### Changes not showing
- Clear your browser cache
- Wait a few minutes for the deployment to complete
- Check the Actions tab to ensure the deployment succeeded

### Build errors
- Check the Actions tab for error messages
- Make sure all dependencies are in `package.json`
- Verify your code doesn't have syntax errors

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file in the `public` folder with your domain name
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings with your custom domain

## Notes

- The site uses localStorage, so each user's data is stored in their browser
- All data is client-side only - no backend server needed
- The site works offline after the first load (thanks to Vite's build process)


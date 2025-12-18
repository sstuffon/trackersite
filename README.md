# Reading Tracker by Stephan

A modern web application for tracking manga and manhwa reading progress. Built for friends to share and compare their reading lists. Search for titles using the Jikan API, rate them on a scale of 0-10, and track how many chapters you've read.

## Features

- 🔍 **Search Manga**: Search for manga/manhwa using the Jikan API (MyAnimeList) with autocomplete
- 📚 **Track Progress**: Update the number of chapters you've read with progress bars
- ⭐ **Rate Titles**: Rate your manga on a scale from 0-10 (with 0.5 increments)
- 👥 **Multi-User Support**: Create and switch between multiple user profiles
- 📝 **Comments**: Add personal notes and comments for each title
- 🏷️ **Status Tracking**: Mark titles as Reading, Completed, Dropped, or On Hold
- 📊 **Statistics**: View stats for each user (total, by status, average rating)
- 💾 **Local Storage**: All data is saved locally in your browser
- 🎨 **Typewriter UI**: Beautiful, minimal design with Courier New font
- 🌐 **English Titles Only**: Automatically filters to show English titles
- 🗺️ **Floating Legend**: Bottom navigation panel for quick filtering and access

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## Usage

1. **Search & Add**: Click on "Search & Add" tab, search for manga/manhwa, and click "Add to List"
2. **View Your List**: Click on "My List" tab to see all your tracked manga
3. **Update Progress**: 
   - Enter your rating (0-10) in the rating input
   - Update the number of chapters you've read
4. **Remove Items**: Click "Remove from List" to remove a manga from your tracking list

## API

This app uses the [Jikan API](https://jikan.moe/) (unofficial MyAnimeList API) to fetch manga data. The API has rate limits:
- 3 requests per second
- 60 requests per minute

The app includes built-in rate limiting to respect these limits.

## Data Storage

All your data (tracked manga, ratings, chapters read) is stored locally in your browser's localStorage. This means:
- Your data persists between sessions
- Your data is private and stays on your device
- Clearing browser data will remove your list

## Technologies Used

- React 18
- Vite
- Axios (for API requests)
- Jikan API v4

## Deployment

This app is designed to be deployed on GitHub Pages. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment:
1. Create a GitHub repository
2. Push your code to the `main` branch
3. Enable GitHub Pages in repository settings
4. The GitHub Actions workflow will automatically deploy your site

## License

MIT


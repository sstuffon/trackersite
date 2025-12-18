// Manga list model - stores manga entries for each user

module.exports = {
  username: String,
  manga: [{
    mal_id: Number,
    title: String,
    title_japanese: String,
    synopsis: String,
    chapters: Number,
    score: Number,
    images: Object,
    type: String,
    status: String,
    published: Object,
    userRating: Number,
    chaptersRead: Number,
    status: String, // reading, completed, dropped, on hold
    comments: String,
    addedDate: String
  }],
  updatedAt: { type: Date, default: Date.now }
};


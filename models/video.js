const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  genre: String,
  description: String,
  url: String,
  rating: Number
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./routes/users');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api/users', userRoutes);

const videoSchema = new mongoose.Schema({
  title: String,
  genre: String,
  description: String,
  url: String,
  rating: Number,
  uploadDate: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

const categorySchema = new mongoose.Schema({
  name: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

const Category = mongoose.model('Category', categorySchema);

app.post('/api/videos', async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    res.status(201).send(video);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const sortBy = req.query.sort || 'title';
    const videos = await Video.find().sort({ [sortBy]: 1 });
    res.send(videos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/videos/filter', async (req, res) => {
  try {
    const genre = req.query.genre;
    const sortBy = req.query.sort || 'title';
    const videos = await Video.find({ genre }).sort({ [sortBy]: 1 });
    res.send(videos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).send('動画が見つかりません');
    }
    res.send(video);
  } catch (error) {
    res.status(500).send('サーバーエラー');
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('videos');
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/sort', (req, res) => {
  console.log('GET /sort request received');
  res.sendFile(path.join(__dirname, 'public', 'sort.html'));
});

app.get('/reset-password', (req, res) => {
  console.log('GET /reset-password request received');
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/filter', (req, res) => {
  console.log('GET /filter request received');
  res.sendFile(path.join(__dirname, 'public', 'filter.html'));
});

app.get('/video-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'video-details.html'));
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(error => console.error(error));

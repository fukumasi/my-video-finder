const mongoose = require('mongoose');

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // これを追加してCORSを有効にします

mongoose.connect('mongodb+srv://fukumasi:JU9PiGhLaRTdDlYs@cluster0.l1ibnnc.mongodb.net/my-video-finder?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('Error connecting to MongoDB:', err));

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// モデル定義
const videoSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  views: Number,
  likes: Number,
  rating: Number
});

const Video = mongoose.model('Video', videoSchema);

// 全動画を取得するエンドポイント
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching videos' });
  }
});

// 特定のカテゴリの動画を取得するエンドポイント
app.get('/api/videos/category/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const videos = await Video.find({ category });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching videos by category' });
  }
});

// 動画を追加するエンドポイント
app.post('/api/videos', async (req, res) => {
  const { title, category, description, views, likes, rating } = req.body;

  const video = new Video({
    title,
    category,
    description,
    views,
    likes,
    rating
  });

  try {
    const newVideo = await video.save();
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ error: 'Error creating video' });
  }
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.get('/api/user/:id', async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching user' });
  }
});

app.put('/api/user/:id', async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      user.email = email || user.email;
      if (password) {
          user.password = bcrypt.hashSync(password, 10);
      }
      await user.save();
      res.json({ message: 'User updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error updating user' });
  }
});

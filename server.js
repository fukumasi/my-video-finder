require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Video = require('./models/video');
const Review = require('./models/review');

const app = express();
const port = process.env.PORT || 3000;

// MongoDBに接続
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 動画の取得API
app.get('/api/videos', async (req, res) => {
    try {
        const category = req.query.category;
        let videos;
        if (category) {
            videos = await Video.find({ category });
        } else {
            videos = await Video.find({});
        }
        res.json(videos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// レビューの取得API
app.get('/api/reviews/:videoId', async (req, res) => {
    try {
        const reviews = await Review.find({ videoId: req.params.videoId });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send(error.message);
    }
});

// レビューの投稿API
app.post('/api/reviews', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/genre.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'genre.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

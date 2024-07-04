const express = require('express');
const router = express.Router();
const Video = require('../models/video');

// 新しい動画を作成
router.post('/', async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    res.status(201).send(video);
  } catch (error) {
    res.status(400).send(error);
  }
});

// 動画一覧を取得（ソート機能付き）
router.get('/', async (req, res) => {
  try {
    const sortBy = req.query.sort || 'title';
    const videos = await Video.find().sort({ [sortBy]: 1 });
    res.send(videos);
  } catch (error) {
    res.status(500).send(error);
  }
});

// ジャンルで動画をフィルタリング
router.get('/filter', async (req, res) => {
  try {
    const genre = req.query.genre;
    const videos = await Video.find({ genre: genre });
    res.send(videos);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 特定の動画を取得
router.get('/:id', async (req, res) => {
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

module.exports = router;

// models/video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true }, // インデックスを追加
  category: { type: String, required: true, index: true }, // インデックスを追加
  description: { type: String, maxlength: 1000 }, // 最大長を1000文字に設定
  views: { type: Number, default: 0, min: 0 }, // 最小値を0に設定
  likes: { type: Number, default: 0, min: 0 }, // 最小値を0に設定
  rating: { type: Number, default: 0, min: 0, max: 5 }, // 0から5の範囲に制限
}, {
  timestamps: true // 自動的にcreatedAtとupdatedAtを管理
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

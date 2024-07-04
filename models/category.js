const mongoose = require('mongoose');
[]
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

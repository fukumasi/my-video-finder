const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const auth = require('../middleware/auth');

// 入力バリデーション関数
const validateReviewInput = (videoId, rating, comment) => {
    const errors = {};
    if (!videoId) errors.videoId = "Video ID is required";
    if (!rating || rating < 1 || rating > 5) errors.rating = "Rating must be between 1 and 5";
    if (!comment) errors.comment = "Comment is required";
    return Object.keys(errors).length === 0 ? null : errors;
};

// 新しいレビューを作成
router.post('/', auth, async (req, res) => {
    console.log('POST /api/reviews called');
    console.log('Request body:', req.body);
    const { videoId, rating, comment } = req.body;

    // 入力バリデーション
    const validationErrors = validateReviewInput(videoId, rating, comment);
    if (validationErrors) {
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({ errors: validationErrors });
    }

    try {
        const review = new Review({
            videoId,
            user: req.user.username, // 注意: この値は信頼できると仮定
            rating,
            comment
        });
        await review.save();
        console.log('Review saved:', review);
        res.status(201).json(review);
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ message: "An error occurred while saving the review" });
    }
});

// 特定のビデオのレビューを取得（ページネーション付き）
router.get('/:videoId', async (req, res) => {
    console.log(`GET /api/reviews/${req.params.videoId} called`);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const reviews = await Review.find({ videoId: req.params.videoId })
            .skip(skip)
            .limit(limit);
        const total = await Review.countDocuments({ videoId: req.params.videoId });
        console.log('Reviews found:', reviews);
        res.status(200).json({
            reviews,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalReviews: total
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: "An error occurred while fetching reviews" });
    }
});

module.exports = router;

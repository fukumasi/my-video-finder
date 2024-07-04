const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// カテゴリー一覧を取得
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().populate('videos');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 特定のカテゴリーを取得
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('videos');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

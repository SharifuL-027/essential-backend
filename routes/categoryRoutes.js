const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getCategories, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route to view categories, Admin route to create categories
router.route('/')
    .get(getCategories)
    .post(protect, adminOnly, createCategory);

// Admin only routes for update and delete
router.route('/:id')
    .put(protect, adminOnly, updateCategory)
    .delete(protect, adminOnly, deleteCategory);

module.exports = router;
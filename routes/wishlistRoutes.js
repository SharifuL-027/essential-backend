const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Route: POST /api/v1/wishlist (Add/Remove product)
// Access: Private
router.post('/', protect, toggleWishlist);

// Route: GET /api/v1/wishlist (Get user's wishlist)
// Access: Private
router.get('/', protect, getWishlist);

module.exports = router;
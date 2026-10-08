const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route: GET /api/v1/users (শুধুমাত্র লগইন করা অ্যাডমিন দেখতে পারবে)
router.get('/', protect, adminOnly, getUsers);

module.exports = router;
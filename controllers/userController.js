const User = require('../models/user');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // সব ইউজারদের খুঁজে বের করবে, তবে সিকিউরিটির জন্য পাসওয়ার্ড (-passwordHash) বাদ দেবে
        const users = await User.find({}).select('-passwordHash'); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

module.exports = { getUsers };
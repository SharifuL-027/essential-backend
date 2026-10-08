const User = require('../models/user');

// @desc    Add or Remove product from wishlist (Toggle)
// @route   POST /api/v1/wishlist
// @access  Private (Login kora thakte hobe)
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        // Check korchi product-ta already wishlist-e ache kina
        const isAlreadyInWishlist = user.wishlist.includes(productId);

        if (isAlreadyInWishlist) {
            // Jodi thake, tahole remove kore dibo
            user.wishlist.pull(productId);
            await user.save();
            res.status(200).json({ 
                message: 'Product removed from wishlist', 
                wishlist: user.wishlist 
            });
        } else {
            // Jodi na thake, tahole add korbo
            user.wishlist.push(productId);
            await user.save();
            res.status(200).json({ 
                message: 'Product added to wishlist', 
                wishlist: user.wishlist 
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        // .populate() use korchi jate shudhu ID noy, puro product-er details chole ashe
        const user = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { toggleWishlist, getWishlist };
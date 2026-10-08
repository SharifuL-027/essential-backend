const Coupon = require('../models/coupon');

// @desc    Create a new coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const { code, discount, expiryDate } = req.body;
        
        // Check korchi ei name already coupon ache kina
        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({ message: 'Coupon already exists' });
        }

        const coupon = await Coupon.create({
            code,
            discount,
            expiryDate,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify/Apply a coupon
// @route   GET /api/v1/coupons/:code
// @access  Public (Guest-rao coupon use korte parbe)
const verifyCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid Coupon Code' });
        }

        // Check korchi coupon off kora ache kina ba date expire hoyeche kina
        if (!coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired or is inactive' });
        }

        // Sob thik thakle discount pathiye dicchi
        res.status(200).json({
            message: 'Coupon applied successfully',
            discount: coupon.discount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all coupons (Admin Only)
// @route   GET /api/v1/coupons
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a coupon (Admin Only)
// @route   DELETE /api/v1/coupons/:id
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (coupon) {
            res.status(200).json({ message: 'Coupon deleted successfully' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCoupon, verifyCoupon, getCoupons, deleteCoupon };

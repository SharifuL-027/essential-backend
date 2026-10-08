const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true, // User choto hater likhleo automatically boro hater (e.g., "EID20") hoye save hobe
        },
        discount: {
            type: Number,
            required: true, // Koto percent chhar (jemon 20 likhle 20%)
        },
        expiryDate: {
            type: Date,
            required: true, // Kobe coupon-er meyad sesh hobe
        },
        isActive: {
            type: Boolean,
            default: true, // Admin chaile meyad thakar por-o coupon off kore dite pare
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
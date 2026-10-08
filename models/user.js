const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Ekhane Product model-ke link kore dilam
            }
        ],
    role: {
        type: String,
        enum: ['Customer', 'Admin'],
        default: 'Customer',
    },
    addressBook: [{
        street: String,
        city: String,
        postalCode: String,
        phone: String
    }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
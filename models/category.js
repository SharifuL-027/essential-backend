const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null, // Null thakle eta main department, ar kono id thakle sub-category
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
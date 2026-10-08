const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            // ভবিষ্যতে React Quill থেকে আসা HTML ডেটা এখানেই সেভ হবে
            type: String,
            required: [true, 'Product description is required'],
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
        },
        // 🔥 নতুন: ডিসকাউন্ট দেখানোর জন্য
        oldPrice: {
            type: Number,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category', 
            required: [true, 'Product category is required'],
        },
        stock: {
            type: Number,
            required: [true, 'Product stock is required'],
            default: 0,
        },
        // মেইন থাম্বনেইল ইমেজ
        image: {
            type: String,
            default: '', 
        },
        // 🔥 নতুন: প্রোডাক্টের ডিটেইলস পেজে গ্যালারি দেখানোর জন্য (একাধিক ছবি)
        images: [
            {
                type: String,
            }
        ],
        // 🔥 নতুন: RAM, ROM, Warranty ইত্যাদি টেবিল আকারে দেখানোর জন্য
        specifications: [
            {
                name: { type: String },  // যেমন: "RAM", "Color"
                value: { type: String }  // যেমন: "8GB", "Black"
            }
        ],
        // 🔥 নতুন: ব্র্যান্ড ফিল্টার করার জন্য (অপশনাল)
        brand: {
            type: String,
            trim: true,
        }
    },
    { timestamps: true }
);

// Mongoose crash থেকে বাঁচতে Guard
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
const Product = require('../models/product');
const Category = require('../models/category'); 

// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { 
            name, slug, description, price, oldPrice, 
            category, stock, brand, image, images, specifications 
        } = req.body;

        // 🔥 বেসিক ফিল্ড ভ্যালিডেশন
        if (!name || !slug || !description || !price || !category) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // 🔥 মাল্টিপল ইমেজ ভ্যালিডেশন (Minimum 2, Maximum 8)
        if (!images || !Array.isArray(images) || images.length < 2 || images.length > 8) {
            return res.status(400).json({ 
                message: 'Please upload minimum 2 and maximum 8 images for the product.' 
            });
        }

        // যদি মেইন image আলাদা করে না পাঠানো হয়, তবে images অ্যারের প্রথম ছবিটাই মেইন image হবে
        const mainImage = image || images[0];

        const product = await Product.create({
            name,
            slug,
            description,
            price,
            oldPrice,
            category,
            stock,
            brand,
            image: mainImage, // 👈 মেইন ইমেজ
            images,           // 👈 সব ইমেজের অ্যারে
            specifications
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all products (with Search, Filter, and Pagination)
// @route   GET /api/v1/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 50; 
        const page = Number(req.query.pageNumber) || 1; 

        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        // 🔥 Category Filter Setup (Case-insensitive Slug Search)
        let categoryFilter = {};

        if (req.query.category) {
            categoryFilter = { category: req.query.category };
        } else if (req.query.categorySlug) {
            const foundCategory = await Category.findOne({ 
                slug: { $regex: new RegExp(`^${req.query.categorySlug}$`, 'i') } 
            });
            
            if (foundCategory) {
                categoryFilter = { category: foundCategory._id };
            } else {
                categoryFilter = { category: null }; 
            }
        }

        // 🔥 Brand Filter Setup (Case-insensitive)
        const brandFilter = req.query.brand 
            ? { brand: { $regex: new RegExp(`^${req.query.brand}$`, 'i') } } 
            : {};

        // 🔥 Database query with keyword, categoryFilter AND brandFilter
        const count = await Product.countDocuments({ ...keyword, ...categoryFilter, ...brandFilter });

        const products = await Product.find({ ...keyword, ...categoryFilter, ...brandFilter })
            .populate('category', 'name slug')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        // শুধুমাত্র একবারই রেসপন্স পাঠাতে হবে
        res.status(200).json({
            count: products.length,
            totalProducts: count,
            page,
            pages: Math.ceil(count / pageSize),
            products,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Fetch single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Invalid product ID or server error' });
    }
};

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (product) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ... তোমার আগের সব কোড (deleteProduct পর্যন্ত) ঠিক থাকবে ...

// @desc    Fetch all unique brands for Navbar
// @route   GET /api/v1/brands
// @access  Public
const getBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('brand'); 
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getBrands };
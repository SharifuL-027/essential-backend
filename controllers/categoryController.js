const Category = require('../models/category'); 
const buildCategoryTree = (categories, parentId = null) => {
    const categoryList = [];
    let category;

    if (parentId === null) {
        // Find main categories (whose parentCategory is null)
        category = categories.filter(cat => cat.parentCategory == undefined || cat.parentCategory == null);
    } else {
        // Find sub-categories matching the parentId
        category = categories.filter(cat => cat.parentCategory && cat.parentCategory.toString() === parentId.toString());
    }

    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            children: buildCategoryTree(categories, cate._id) // Recursive call for deeply nested menus
        });
    }
    return categoryList;
};


// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;
        let { slug } = req.body;

        // Auto-generate slug from name if user doesn't provide one
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const categoryExists = await Category.findOne({ slug });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category slug already exists' });
        }

        const category = await Category.create({
            name,
            slug,
            parentCategory: parentCategory || null,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get all categories (nested format for mega-menu)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        // Fetch all categories
        const categories = await Category.find({});
        
        // Convert flat list to hierarchical tree for React
        const categoryTree = buildCategoryTree(categories);
        
        res.status(200).json(categoryTree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const { name, slug, parentCategory } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = name || category.name;
        category.slug = slug || category.slug;
        category.parentCategory = parentCategory !== undefined ? parentCategory : category.parentCategory;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.deleteOne();
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
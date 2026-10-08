const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getBrands } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route: POST /api/v1/products
// Access: Private/Admin (Shudhu matro admin e product add korte parbe)
router.get('/brands', getBrands);
router.post('/', protect, adminOnly, createProduct);
// Route: GET /api/v1/products
// Access: Public
router.get('/', getProducts);
// Route: GET /api/v1/products/:id
// Access: Public
router.get('/:id', getProductById);
// Route: PUT (Update) /api/v1/products/:id
// Access: Private/Admin
router.put('/:id', protect, adminOnly, updateProduct);

// Route: DELETE /api/v1/products/:id
// Access: Private/Admin
router.delete('/:id', protect, adminOnly, deleteProduct);


module.exports = router;
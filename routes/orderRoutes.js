const express = require('express');
const router = express.Router();
// 🔥 updateOrderStatus ফাংশনটি ইমপোর্ট করা হলো
const { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    getOrderById, 
    updateOrderToDelivered, 
    updateOrderStatus 
} = require('../controllers/orderController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route: POST /api/v1/orders
// Access: Public/Private (Login chharao jate order kora jay tai protect bad deya hoyeche)
router.post('/', addOrderItems);

// Route: GET /api/v1/orders/myorders
// Access: Private
router.get('/myorders', protect, getMyOrders);

// Route: GET /api/v1/orders
// Access: Private/Admin
router.get('/', protect, adminOnly, getOrders);

// Route: GET /api/v1/orders/:id
// Access: Private
router.get('/:id', protect, getOrderById);

// Route: PUT /api/v1/orders/:id/deliver (আগের ডেলিভারি রাউট - চাইলে রাখতে পারো)
// Access: Private/Admin
router.put('/:id/deliver', protect, adminOnly, updateOrderToDelivered);

// 🔥 Route: PUT /api/v1/orders/:id/status (নতুন ৩টি স্টেপের স্ট্যাটাস আপডেটের জন্য)
// Access: Private/Admin
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
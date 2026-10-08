const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrders, getOrderById, updateOrderToDelivered } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route: POST /api/v1/orders
// Access: Private (Login kora thakte hobe, tai 'protect' use kora hoyeche)
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

// Route: PUT /api/v1/orders/:id/deliver
// Access: Private/Admin
router.put('/:id/deliver', protect, adminOnly, updateOrderToDelivered);

module.exports = router;
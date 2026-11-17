const express = require('express');
const router = express.Router();

const { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    getOrderById, 
    updateOrderToDelivered, 
    updateOrderStatus,
    deleteOrder,
    updateOrderDetails ,
    trackGuestOrders
} = require('../controllers/orderController');

// তোমার মিডলওয়্যারে ফাংশনের নাম adminOnly
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route: POST /api/v1/orders
router.post('/', addOrderItems);

// Route: GET /api/v1/orders/myorders
router.get('/myorders', protect, getMyOrders);

// Route: GET /api/v1/orders
router.get('/', protect, adminOnly, getOrders);

// Route: GET /api/v1/orders/:id
router.get('/:id', protect, getOrderById);

// Route: PUT /api/v1/orders/:id/deliver
router.put('/:id/deliver', protect, adminOnly, updateOrderToDelivered);

// Route: PUT /api/v1/orders/:id/status
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// Route: PUT & DELETE /api/v1/orders/:id
router.put('/:id', protect, adminOnly, updateOrderDetails);
router.delete('/:id', protect, adminOnly, deleteOrder);
router.post('/track', trackGuestOrders);

module.exports = router;
const jwt = require('jsonwebtoken');
const Order = require('../models/order');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private (Sudhumatro login kora user-ra order korte parbe)
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items found' });
        }

        let userId = null;
        
        // Header-e token thakle (mane login kora thakle) user ID ber korbo
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (error) {
                // Token bhul thakle ignore korbe, guest hisabe order nibe
            }
        }

        const order = new Order({
            user: userId, // Login kora thakle ID jabe, na thakle null jabe
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        // req.user._id diye amra shudhu oi user-er order khujchi
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        // .populate() diye user-er id-r bodole tar nam ar email niye aschi
        const orders = await Order.find({}).populate('user', 'id name email');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            // order.deliveredAt = Date.now(); // Chaile kon shomoy deliver holo setao save korte paro

            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addOrderItems, getMyOrders, getOrders, getOrderById, updateOrderToDelivered };
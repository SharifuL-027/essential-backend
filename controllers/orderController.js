const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const Product = require('../models/product'); // 🔥 Product মডেল ইম্পোর্ট করা হলো (ফাইলের নাম বড় হাতের হলে '../models/Product' দিও)

// হেল্পার ফাংশন: প্রোডাক্টের স্টক কমানো বা বাড়ানোর জন্য (stock ও countInStock দুটিই সাপোর্ট করবে)
const adjustProductStock = async (orderItems, action = 'decrease') => {
    for (const item of orderItems) {
        const productId = item.product?._id || item.product;
        if (!productId) continue;

        const product = await Product.findById(productId);
        if (product) {
            const qty = Number(item.qty || item.quantity || 1);
            const change = action === 'decrease' ? -qty : qty;

            if (product.stock !== undefined) {
                product.stock = Math.max(0, product.stock + change);
            }
            if (product.countInStock !== undefined) {
                product.countInStock = Math.max(0, product.countInStock + change);
            }
            await product.save();
        }
    }
};

// @desc    Create new order & reduce product stock
// @route   POST /api/v1/orders
// @access  Public / Private
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items found' });
        }

        // ১. 🔥 অর্ডার নেওয়ার আগে চেক করি সব প্রোডাক্টের পর্যাপ্ত স্টক আছে কি না
        for (const item of orderItems) {
            const productId = item.product?._id || item.product;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }
            const orderQty = Number(item.qty || item.quantity || 1);
            const availableStock = product.stock !== undefined ? product.stock : (product.countInStock ?? 0);

            if (availableStock < orderQty) {
                return res.status(400).json({ 
                    message: `"${product.name}" has only ${availableStock} item(s) left in stock!` 
                });
            }
        }

        let userId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (error) {
                // Guest order
            }
        }

        const order = new Order({
            user: userId,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // ২. 🔥 অর্ডার সেভ হওয়ার সাথে সাথেই স্টক কমিয়ে দেওয়া
        await adjustProductStock(orderItems, 'decrease');

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
            order.status = 'Delivered';
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 Status update + Cancelled হলে স্টক ফেরত দেওয়ার লজিক
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            const previousStatus = order.status || 'Pending';
            const newStatus = req.body.status;

            // অর্ডার যদি আগে Cancelled না থাকে এবং এখন Cancelled করা হয় -> স্টক ফেরত দাও
            if (previousStatus !== 'Cancelled' && newStatus === 'Cancelled') {
                await adjustProductStock(order.orderItems, 'increase');
            }
            // অর্ডার যদি আগে Cancelled থাকে এবং আবার অ্যাকটিভ স্ট্যাটাসে নেওয়া হয় -> স্টক আবার কমাও
            else if (previousStatus === 'Cancelled' && newStatus !== 'Cancelled') {
                await adjustProductStock(order.orderItems, 'decrease');
            }

            order.status = newStatus;

            if (newStatus === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 Admin Order Details Edit করার ফাংশন (Edit Modal থেকে সেভ করার জন্য)
const updateOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.shippingAddress = req.body.shippingAddress || order.shippingAddress;
        order.orderItems = req.body.orderItems || order.orderItems;
        order.totalPrice = req.body.totalPrice !== undefined ? req.body.totalPrice : order.totalPrice;
        order.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : order.isPaid;
        if (order.isPaid && !order.paidAt) {
            order.paidAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 Order Delete করার ফাংশন (Cancelled না হয়ে থাকলে স্টক ফেরত দিয়ে ডিলিট করবে)
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (order) {
            if (order.status !== 'Cancelled') {
                await adjustProductStock(order.orderItems, 'increase');
            }
            await Order.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Order deleted and stock restored successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Track guest orders by phone number or Order ID
// @route   POST /api/v1/orders/track
// @access  Public
const trackGuestOrders = async (req, res) => {
  try {
    const { phone, orderId } = req.body;

    if (!phone && !orderId) {
      return res.status(400).json({ message: 'Please provide a phone number or Order ID' });
    }

    let query = {};
    if (orderId) {
      // পুরো ID অথবা শেষের ৮ ডিজিট দিয়ে সার্চ সাপোর্ট
      const cleanId = orderId.replace('#', '').trim();
      if (cleanId.length === 24) {
        query._id = cleanId;
      } else {
        const allOrders = await Order.find({}).sort({ createdAt: -1 });
        const matched = allOrders.filter(o => 
          String(o._id).toUpperCase().endsWith(cleanId.toUpperCase())
        );
        return res.status(200).json(matched);
      }
    } else if (phone) {
      query['shippingAddress.phone'] = { $regex: phone.trim(), $options: 'i' };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    getOrderById, 
    updateOrderToDelivered, 
    updateOrderStatus, 
    updateOrderDetails,
    deleteOrder,
    trackGuestOrders 
};
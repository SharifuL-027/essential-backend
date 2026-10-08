const Order = require('../models/order'); 
const Product = require('../models/product')

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // ১. টোটাল রেভিনিউ এবং টোটাল অর্ডারের সংখ্যা বের করা (Aggregation)
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ]);

        const totalOrders = orderStats.length > 0 ? orderStats[0].totalOrders : 0;
        const totalRevenue = orderStats.length > 0 ? orderStats[0].totalRevenue : 0;

        // ২. টোটাল প্রোডাক্ট এবং লো-স্টক প্রোডাক্ট বের করা
        const totalProducts = await Product.countDocuments();
        
        const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
            .select('name stock price image')
            .lean(); // .lean() দিলে কুয়েরি ফাস্ট হয়

        // ৩. লেটেস্ট ৫টি অর্ডার বের করা
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id totalPrice createdAt shippingAddress isPaid isDelivered')
            .lean();

        // ৪. টপ ৩টি প্রোডাক্ট (আপাতত লেটেস্ট ৩টি দেখাচ্ছি)
        const topProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select('name image price stock')
            .lean();

        // সব ডেটা একসাথে রেসপন্স হিসেবে পাঠানো হচ্ছে
        res.status(200).json({
            success: true,
            totalOrders,
            totalRevenue,
            totalProducts,
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
            recentOrders,
            topProducts
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardStats };
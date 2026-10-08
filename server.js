const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
// 1. Load env vars (Do this before anything else)
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// 3. Determine which frontend URL to use based on environment
const clientUrl = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_DEV;

// 4. Middleware Setup
app.use(cors({
    origin: clientUrl,
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json()); // Parses incoming JSON requests

// 5. Load API Prefix from env (defaults to '/api/v1' if not found)
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// 6. Mount Routes Dynamically (MUST be before app.listen)
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/auth`, authRoutes); // Auth route added here
app.use('/api/v1/products', productRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/v1/settings', require('./routes/settingRoutes'));
// 7. Basic Route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// 8. Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}${apiPrefix}`);
});
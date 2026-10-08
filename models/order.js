const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Eita false kore dilam jate login chhara order nite pare
            ref: 'User',
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true }, // Koyta kineche
                image: { type: String, required: false },
                price: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product', // Kon product kineche tar id
                },
            }
        ],
        shippingAddress: {
            name: { type: String, required: true },  // Notun: Guest-er nam
            email: { type: String, required: true }, // Notun: Guest-er email
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            phone: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true, // Jemon: 'Cash On Delivery' ba 'Bkash'
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNo: { type: Number, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    deliveryDetails: {
        receiverPhone: { type: String, required: true },
        street: { type: String, required: true },
        houseNo: String,
        city: { type: String, required: true }
    },
    orderLocation: {
        latitude: Number,
        longitude: Number,
        timestamp: Date
    },
    status: { type: String, default: 'Pending' }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);

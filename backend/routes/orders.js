const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');

const Counter = require('../models/Counter');

// @route   POST api/orders
router.post('/', auth, async (req, res) => {
    const { products, totalAmount, deliveryDetails } = req.body;
    try {
        // 1. Verify stock availability first
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productId}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
            }
        }

        // 2. Deduct stock
        for (const item of products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // 3. Increment order counter
        const counter = await Counter.findOneAndUpdate(
            { id: 'orderId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const newOrder = new Order({
            orderNo: counter.seq,
            userId: req.user.id,
            products,
            totalAmount,
            deliveryDetails,
            orderLocation: req.body.orderLocation
        });
        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/orders
router.get('/', [auth, admin], async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('products.productId')
            .populate('userId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT api/orders/:id/status
router.put('/:id/status', [auth, admin], async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.query.status },
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE api/orders/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

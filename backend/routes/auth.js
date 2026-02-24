const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth, admin } = require('../middleware/auth');

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role, phone, location } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({
            name,
            email,
            password,
            phone,
            roles: role ? [role] : ['USER'],
            lastLocation: location ? {
                latitude: location.lat,
                longitude: location.lng,
                timestamp: new Date()
            } : undefined
        });
        await user.save();
        res.json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    const { email, password, location } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { id: user.id, roles: user.roles };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        // Update location during login if provided
        if (location) {
            user.lastLocation = {
                latitude: location.lat,
                longitude: location.lng,
                timestamp: new Date()
            };
            await user.save();
        }

        res.json({ token, email: user.email, roles: user.roles });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('Fetch me error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/auth/users
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// LOGIN endpoint
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required' });
        }

        email = email.trim();

        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { sid: email.toUpperCase() }
            ]
        });

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        await user.save();

        const userData = user.toObject();
        delete userData.password;

        res.json({ status: 'success', user: userData });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;

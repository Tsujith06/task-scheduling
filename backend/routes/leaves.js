const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

router.get('/', async (req, res) => {
    try {
        const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leaves' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newLeave = new LeaveRequest(req.body);
        const saved = await newLeave.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Status update failed' });
    }
});

module.exports = router;

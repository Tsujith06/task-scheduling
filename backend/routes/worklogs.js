const express = require('express');
const router = express.Router();
const Worklog = require('../models/Worklog');

// GET all worklogs
router.get('/', async (req, res) => {
    try {
        const { userId, week } = req.query;
        let query = {};
        if (userId) query.userId = userId;
        if (week) query.week = week;

        const logs = await Worklog.find(query).sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch worklogs' });
    }
});

// CREATE log entry
router.post('/', async (req, res) => {
    try {
        const newLog = new Worklog(req.body);
        const saved = await newLog.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Failed to record worklog' });
    }
});

// UPDATE log (approval/remarks)
router.put('/:id', async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const updated = await Worklog.findByIdAndUpdate(
            req.params.id,
            { status, remarks },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Failed to update worklog' });
    }
});

// DELETE log
router.delete('/:id', async (req, res) => {
    try {
        await Worklog.findByIdAndDelete(req.params.id);
        res.json({ status: 'success', id: req.params.id });
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Failed to delete entry' });
    }
});

module.exports = router;

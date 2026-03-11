const express = require('express');
const router = express.Router();
const ReviewPhase = require('../models/ReviewPhase');

router.get('/', async (req, res) => {
    try {
        const phases = await ReviewPhase.find().sort({ startDate: 1 });
        res.json(phases);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch phases' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newPhase = new ReviewPhase(req.body);
        const saved = await newPhase.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await ReviewPhase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await ReviewPhase.findByIdAndDelete(req.params.id);
        res.json({ message: 'Phase deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

module.exports = router;

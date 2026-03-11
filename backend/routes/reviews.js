const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// GET all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ phaseId: 1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch reviews' });
    }
});

// Seed Initial Reviews (Debug/Setup helper)
router.post('/seed', async (req, res) => {
    try {
        await Review.deleteMany({});
        const initial = [
            {
                phaseId: 1,
                phase: "Review 1 (Conceptual)",
                date: "Feb 15, 2024",
                status: "Completed",
                scores: { "Arjun Kumar": 85, "Priya Singh": 82, "Rohit Das": 78, "Sneha M": 88 },
                remarks: "Solid conceptual foundation. Good team understanding."
            },
            {
                phaseId: 2,
                phase: "Review 2 (Design & Prototype)",
                date: "Mar 10, 2024",
                status: "Completed",
                scores: { "Arjun Kumar": 78, "Priya Singh": 80, "Rohit Das": 75, "Sneha M": 82 },
                remarks: "Technical implementation is on track. Focus on UX refinement."
            },
            {
                phaseId: 3,
                phase: "Final Review (Deployment)",
                date: "May 10, 2024",
                status: "Upcoming",
                scores: { "Arjun Kumar": "—", "Priya Singh": "—", "Rohit Das": "—", "Sneha M": "—" },
                remarks: "Scheduled for Phase 4 completion."
            }
        ];
        const saved = await Review.insertMany(initial);
        res.json({ status: 'success', data: saved });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;

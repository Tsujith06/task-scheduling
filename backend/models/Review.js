const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    phaseId: { type: Number, required: true }, // 1, 2, 3
    phase: { type: String, required: true }, // e.g. "Review 1 (Conceptual)"
    date: { type: String, required: true }, // Completed date
    status: { type: String, enum: ['Completed', 'Upcoming'], default: 'Upcoming' },
    scores: {
        type: Map, // Stores Name: Marks (e.g. "Arjun Kumar": 85)
        of: mongoose.Schema.Types.Mixed // Mixed to handle marks or "—"
    },
    remarks: { type: String }, // Mentor remarks
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);

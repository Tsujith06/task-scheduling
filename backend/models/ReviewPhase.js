const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Name of the Phase group
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    targets: { type: Array, default: [] },
    // Support legacy fields
    targetTitle: { type: String },
    targetDescription: { type: String },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
    reviews: [{
        title: { type: String, required: true }, // Name of the Review
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        maxMarks: { type: Number, default: 100 },
        rubrics: [{
            title: { type: String, required: true },
            description: { type: String },
            maxMarks: { type: Number, default: 10 }
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReviewPhase', phaseSchema);

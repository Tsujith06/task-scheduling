const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g. Review 1
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
    maxMarks: { type: Number, default: 100 },
    weightage: { type: Number, default: 25 },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Postponed'], default: 'Upcoming' },
    venue: { type: String },
    description: { type: String }
});

module.exports = mongoose.model('ReviewPhase', phaseSchema);

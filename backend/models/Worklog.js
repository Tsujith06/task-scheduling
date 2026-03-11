const mongoose = require('mongoose');

const worklogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    week: { type: String, required: true }, // e.g. "Week 07"
    date: { type: String, required: true }, // Logged date
    task: { type: String, required: true },
    description: { type: String },
    pct: { type: Number, min: 0, max: 100 }, // completion status
    status: { type: String, enum: ['Pending', 'Approved', 'Declined'], default: 'Pending' },
    remarks: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worklog', worklogSchema);

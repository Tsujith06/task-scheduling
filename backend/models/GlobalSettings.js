const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    maxTeamSize: { type: Number, default: 4 },
    teamDeadline: { type: Date },
    mentorTeamLimit: { type: Number, default: 5 },
    submissionDeadline: { type: Date },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
